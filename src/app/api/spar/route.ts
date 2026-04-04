import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { buildSparringPrompt } from "@/lib/prompts/sparring";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

interface SparRequestBody {
  messages?: unknown;
  clause?: {
    title?: unknown;
    originalText?: unknown;
    severity?: unknown;
    explanation?: unknown;
    leverage?: unknown;
    contractType?: unknown;
  };
}

export async function POST(request: NextRequest) {
  // ── Rate limiting (50 sparring messages per hour per IP) ──────────────────
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = rateLimit(ip, "spar", { maxRequests: 50, windowMs: 60 * 60 * 1000 });
  if (limited) {
    return NextResponse.json(
      { error: limited.error },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  // ── Check API key configuration ───────────────────────────────────────────
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[spar] GOOGLE_GENERATIVE_AI_API_KEY is not configured in environment");
    return jsonError(
      "Sparring service is not configured. Please contact support.",
      500
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: SparRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonError(
      "Invalid request body. Please send a valid JSON object.",
      400
    );
  }

  if (!body || typeof body !== "object") {
    return jsonError("Invalid request body.", 400);
  }

  // ── Validate messages ─────────────────────────────────────────────────────
  const { messages, clause } = body;

  if (!Array.isArray(messages)) {
    return jsonError(
      "Invalid request: 'messages' must be an array.",
      400
    );
  }

  if (messages.length === 0) {
    return jsonError(
      "Invalid request: 'messages' must not be empty.",
      400
    );
  }

  // ── Validate clause ───────────────────────────────────────────────────────
  if (!clause || typeof clause !== "object") {
    return jsonError(
      "Invalid request: 'clause' object is required.",
      400
    );
  }

  if (typeof clause.title !== "string" || !clause.title.trim()) {
    return jsonError(
      "Invalid request: clause must have a non-empty 'title'.",
      400
    );
  }

  if (typeof clause.originalText !== "string" || !clause.originalText.trim()) {
    return jsonError(
      "Invalid request: clause must have non-empty 'originalText'.",
      400
    );
  }

  // ── Build prompt and stream response ──────────────────────────────────────
  try {
    const systemPrompt = buildSparringPrompt(
      {
        title: clause.title as string,
        originalText: clause.originalText as string,
        severity: (clause.severity as "red" | "amber" | "green") ?? "amber",
        explanation: (clause.explanation as string) ?? "",
        leverage: (clause.leverage as string) ?? "",
      },
      clause.contractType as string | undefined
    );

    const result = streamText({
      model: google("gemini-2.5-pro"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages as UIMessage[]),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    // Detect timeout-like errors
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("aborted")
    ) {
      console.error("[spar] Claude API timeout:", errorMessage);
      return jsonError(
        "Sparring response is taking longer than expected. Please try again.",
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
      console.error("[spar] Claude API authentication error:", errorMessage);
      return jsonError(
        "Sparring service is not configured. Please contact support.",
        500
      );
    }

    // Generic error
    console.error("[spar] Claude API error:", errorMessage);
    return jsonError(
      "We had trouble generating a response. Please try again.",
      500
    );
  }
}
