import type { Clause } from "@/lib/types";

/**
 * Builds the system prompt for generating a 3-bullet negotiation cheat sheet.
 * Receives the clause details, sparring exchange messages, and contract type.
 */
export function buildScriptPrompt(
  clause: Clause,
  messages: Array<{ role: string; content: string }>,
  contractType?: string
): string {
  const roleLabel = contractType
    ? contractType.replace(/_/g, " ")
    : "employer";

  const exchangeBlock = messages
    .map((m) => `[${m.role === "user" ? "Worker" : "Counterparty"}]: ${m.content}`)
    .join("\n\n");

  return `You are an expert negotiation coach. Based on a practice sparring session, produce a concise 3-bullet negotiation cheat sheet the worker can screenshot and use in a real conversation.

## Clause Being Negotiated

**${clause.title}** (Severity: ${clause.severity})

Original text: "${clause.originalText}"

Explanation: ${clause.explanation}

Leverage: ${clause.leverage}

## Context

The worker is negotiating with a ${roleLabel}. Here is their practice sparring exchange:

${exchangeBlock}

## Instructions

1. Analyze what worked and what didn't in the worker's practice attempts.
2. Produce exactly 3 bullets — each starting with an actionable verb: "Say:", "Ask:", or "Insist:".
3. Each bullet should be a complete, natural sentence the worker can use verbatim in the real negotiation.
4. The title should be specific to this clause (e.g., "Your Non-Compete Negotiation Script").
5. The tone tip should be one sentence about delivery — confident but collaborative, firm but professional, etc.
6. Keep everything concise and screenshot-friendly — no long paragraphs.`;
}
