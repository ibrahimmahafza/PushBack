import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { NegotiationScriptSchema, ClauseSchema } from "@/lib/types";
import { buildScriptPrompt } from "@/lib/prompts/script";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestBodySchema = z.object({
  clause: ClauseSchema,
  messages: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .min(1, "At least one sparring message is required"),
  contractType: z.string().optional(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  // ── Check API key configuration ───────────────────────────────────────────
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[script] GOOGLE_GENERATIVE_AI_API_KEY is not configured in environment");
    return jsonError(
      "Script generation service is not configured. Please contact support.",
      500
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(
      "Invalid request body. Please send a valid JSON object.",
      400
    );
  }

  // ── Validate input with Zod ───────────────────────────────────────────────
  const parsed = RequestBodySchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return jsonError(firstError, 400);
  }

  const { clause, messages, contractType } = parsed.data;

  // ── Call Claude for script generation ─────────────────────────────────────
  try {
    const systemPrompt = buildScriptPrompt(clause, messages, contractType);

    const { object: script } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: NegotiationScriptSchema,
      system: systemPrompt,
      prompt: "Generate the 3-bullet negotiation cheat sheet based on the sparring session above.",
    });

    return NextResponse.json(script);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    // Detect timeout-like errors
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("aborted")
    ) {
      console.error("[script] Claude API timeout:", errorMessage);
      return jsonError(
        "Script generation is taking longer than expected. Please try again.",
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
      console.error("[script] Claude API authentication error:", errorMessage);
      return jsonError(
        "Script generation service is not configured. Please contact support.",
        500
      );
    }

    // Generic error — never leak details
    console.error("[script] Claude API error:", errorMessage);
    return jsonError(
      "We had trouble generating your script. Please try again.",
      500
    );
  }
}
