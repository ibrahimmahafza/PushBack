import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { ContractAnalysisSchema } from "@/lib/types";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/prompts/analysis";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Minimum contract text length to analyze */
const MIN_TEXT_LENGTH = 50;

/** Maximum contract text length to analyze (100K chars) */
const MAX_TEXT_LENGTH = 100_000;

/** Patterns that indicate prompt injection attempts */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above/i,
  /you\s+are\s+now\s+/i,
  /system\s*prompt/i,
  /reveal\s+your\s+(instructions|prompt|system)/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if/i,
  /disregard\s+(all|any|your)/i,
];

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  // ── Rate limiting (10 analyses per hour per IP) ───────────────────────────
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = rateLimit(ip, "analyze", { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (limited) {
    return NextResponse.json(
      { error: limited.error },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  // ── Check API key configuration ───────────────────────────────────────────
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error(
      "[analyze] GOOGLE_GENERATIVE_AI_API_KEY is not configured in environment"
    );
    return jsonError(
      "Analysis service is not configured. Please contact support.",
      500
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(
      "Invalid request body. Please send a JSON object with a 'text' field containing your contract text.",
      400
    );
  }

  // ── Validate input ────────────────────────────────────────────────────────
  if (!body || typeof body !== "object") {
    return jsonError(
      "Invalid request body. Please send a JSON object with a 'text' field.",
      400
    );
  }

  const { text } = body as { text?: unknown };

  if (text === undefined || text === null) {
    return jsonError(
      "Missing 'text' field. Please include the contract text you want analyzed.",
      400
    );
  }

  if (typeof text !== "string") {
    return jsonError(
      "The 'text' field must be a string containing your contract text.",
      400
    );
  }

  if (text.length < MIN_TEXT_LENGTH) {
    return jsonError(
      `Contract text is too short (${text.length} characters). Please provide at least ${MIN_TEXT_LENGTH} characters for a meaningful analysis.`,
      400
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return jsonError(
      `Contract text is too long (${text.length} characters). Please limit to ${MAX_TEXT_LENGTH.toLocaleString()} characters.`,
      400
    );
  }

  // ── Prompt injection check ──────────────────────────────────────────────
  if (INJECTION_PATTERNS.some((pattern) => pattern.test(text))) {
    console.warn("[analyze] Prompt injection attempt detected from IP:", ip);
    return jsonError(
      "The submitted text contains patterns that cannot be processed. Please submit a valid contract.",
      400
    );
  }

  // ── Truncate very long contracts to fit model context ───────────────────
  const truncatedText = text.length > 50_000 
    ? text.slice(0, 50_000) + "\n\n[Contract text truncated at 50,000 characters for analysis]"
    : text;

  // ── Call AI for analysis ──────────────────────────────────────────────────
  try {
    const { object: analysis } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: ContractAnalysisSchema,
      system: ANALYSIS_SYSTEM_PROMPT,
      prompt: `Analyze the following contract and provide a structured analysis:\n\n${truncatedText}`,
    });

    return NextResponse.json(analysis);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    // Detect timeout-like errors
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("aborted")
    ) {
      console.error("[analyze] Claude API timeout:", errorMessage);
      return jsonError(
        "Analysis is taking longer than expected. Please try again.",
        500
      );
    }

    // Detect auth/config errors
    if (
      errorMessage.includes("401") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("invalid_api_key") ||
      errorMessage.includes("invalid x-api-key")
    ) {
      console.error("[analyze] Claude API authentication error:", errorMessage);
      return jsonError(
        "Analysis service is not configured. Please contact support.",
        500
      );
    }

    // Generic error — never leak contract text in logs
    console.error(
      "[analyze] Claude API error:",
      errorMessage,
      `(text length: ${text.length} chars)`
    );
    return jsonError(
      "We had trouble analyzing this contract. Please try again or simplify the text.",
      500
    );
  }
}
