"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, Sparkles, Send, Swords, RotateCcw } from "lucide-react";
import type { Clause } from "@/lib/types";
import CoachingNote from "./CoachingNote";

// ─── Severity badge styles (mirrors ClauseCard pattern) ───────────────────────
const SEVERITY_STYLES: Record<
  string,
  { badge: string; label: string }
> = {
  red: {
    badge: "bg-danger/15 text-danger-light border-danger/30",
    label: "Dangerous",
  },
  amber: {
    badge: "bg-warning/15 text-warning-light border-warning/30",
    label: "Concerning",
  },
  green: {
    badge: "bg-safe/15 text-safe-light border-safe/30",
    label: "Fair",
  },
};

// ─── Delimiter parsing ────────────────────────────────────────────────────────
const COACHING_DELIMITER = "---COACHING---";

function parseAssistantMessage(text: string): {
  counterpartyText: string;
  coachingNote: string | null;
} {
  const delimiterIndex = text.indexOf(COACHING_DELIMITER);
  if (delimiterIndex === -1) {
    return { counterpartyText: text, coachingNote: null };
  }
  return {
    counterpartyText: text.slice(0, delimiterIndex).trim(),
    coachingNote: text.slice(delimiterIndex + COACHING_DELIMITER.length).trim(),
  };
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (message.parts) {
    return message.parts
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text!)
      .join("");
  }
  return "";
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SparringSessionProps {
  clause: Clause;
  contractType?: string;
  onBack: () => void;
  onGetScript?: (messages: Array<{ role: string; content: string }>) => void;
}

export default function SparringSession({
  clause,
  contractType,
  onBack,
  onGetScript,
}: SparringSessionProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build transport once, stable across renders
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/spar",
        body: { clause, contractType },
      }),
    // clause identity is stable from parent — only rebuild on actual clause change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clause.title, clause.originalText, contractType]
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  // Count assistant (exchange) messages
  const exchangeCount = messages.filter((m) => m.role === "assistant").length;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // ── Get Script handler ──────────────────────────────────────────────────────
  function handleGetScript() {
    if (!onGetScript) return;
    const extracted = messages.map((m) => {
      let content = getMessageText(m);
      // Strip coaching delimiters from assistant messages
      if (m.role === "assistant") {
        const delimIdx = content.indexOf(COACHING_DELIMITER);
        if (delimIdx !== -1) {
          content = content.slice(0, delimIdx).trim();
        }
      }
      return { role: m.role, content };
    });
    onGetScript(extracted);
  }

  // ── Send handler ──────────────────────────────────────────────────────────
  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Retry handler (resend last user message) ─────────────────────────────
  function handleRetry() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      const text = getMessageText(lastUserMsg);
      if (text) {
        sendMessage({ text });
      }
    }
  }

  const severity = SEVERITY_STYLES[clause.severity] ?? SEVERITY_STYLES.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full max-h-[80vh] glass-card rounded-2xl"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-surface/40 backdrop-blur-md px-5 py-4 rounded-t-2xl">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Analysis
        </button>
        <div className="flex-1" />
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${severity.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${
            clause.severity === "red" ? "bg-danger-light animate-pulse-dot" :
            clause.severity === "amber" ? "bg-warning-light" : "bg-safe-light"
          }`} />
          {severity.label}
        </span>
        <h3 className="text-sm font-semibold text-foreground truncate max-w-xs">
          {clause.title}
        </h3>
      </div>

      {/* ── Exchange counter ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-white/5 text-xs text-muted">
        <span>
          Exchange {exchangeCount} of 8
        </span>
        {exchangeCount >= 5 && (
          <span className="flex items-center gap-2 text-accent-light">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready to generate your script?</span>
            {onGetScript && (
              <button
                onClick={handleGetScript}
                disabled={isLoading}
                className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Get My Script
              </button>
            )}
          </span>
        )}
      </div>

      {/* ── Message list ──────────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Empty state intro */}
        {messages.length === 0 && !isLoading && (
          <div className="glass-card rounded-xl border border-accent/20 px-5 py-5 text-center glow-accent">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 mx-auto mb-3">
              <Swords className="h-5 w-5 text-accent-light" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Negotiation Practice
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-sm mx-auto">
              You&apos;re about to practice negotiating{" "}
              <strong className="text-foreground">{clause.title}</strong>. The AI
              will play a realistic counterparty. Try making your case!
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const text = getMessageText(message);
          if (!text) return null;

          if (message.role === "user") {
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-end"
              >
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-accent/10 border border-accent/20 backdrop-blur-sm px-4 py-3 glow-accent-hover transition-shadow">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {text}
                  </p>
                </div>
              </motion.div>
            );
          }

          // Assistant message — parse coaching delimiter
          const { counterpartyText, coachingNote } = parseAssistantMessage(text);

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-start max-w-[85%]"
            >
              <div className="glass-card rounded-2xl rounded-bl-md bg-white/5 px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {counterpartyText}
                </p>
              </div>
              {coachingNote && <CoachingNote note={coachingNote} />}
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && exchangeCount === messages.filter((m) => m.role === "assistant").length && (
          <div className="flex items-start">
            <div className="glass-card rounded-2xl rounded-bl-md bg-white/5 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-5 mb-3 rounded-xl border border-danger/20 bg-danger/5 backdrop-blur-sm px-4 py-3">
          <p className="text-sm text-foreground/80 mb-2">
            The AI counterparty had trouble responding. Let&apos;s try again.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="rounded-lg bg-accent/20 border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent-light hover:bg-accent/30 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
            <button
              onClick={onBack}
              className="rounded-lg bg-surface border border-white/10 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Back to Analysis
            </button>
          </div>
        </div>
      )}

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div className="border-t border-white/5 bg-surface/30 backdrop-blur-md px-3 py-3 sm:px-5 sm:py-4 rounded-b-2xl">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Make your case…"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-white/5 bg-background/80 backdrop-blur-sm px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-xl bg-accent/20 border border-accent/30 px-4 py-2.5 text-sm font-medium text-accent-light hover:bg-accent/30 hover:glow-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
