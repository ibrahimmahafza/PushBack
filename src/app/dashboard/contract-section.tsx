"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { AlertCircle, Loader2, History, Clock, ChevronRight } from "lucide-react";
import ContractUpload from "@/components/ContractUpload";
import ContractPreview from "@/components/ContractPreview";
import AnalysisLoading from "@/components/AnalysisLoading";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import SparringSession from "@/components/SparringSession";
import VoiceSparring from "@/components/VoiceSparring";
import ScriptCard from "@/components/ScriptCard";
import type { ContractAnalysis, Clause, NegotiationScript } from "@/lib/types";

type Phase = "upload" | "preview" | "analyzing" | "analysis" | "sparring-choose" | "sparring" | "sparring-voice" | "generating-script" | "script" | "error";

interface ExtractedContract {
  text: string;
  pages?: number;
}

interface HistoryEntry {
  title: string;
  timestamp: Date;
  analysis: ContractAnalysis;
}

export default function ContractSection() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [extracted, setExtracted] = useState<ExtractedContract | null>(null);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [script, setScript] = useState<NegotiationScript | null>(null);
  const [sparringMessages, setSparringMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const resetAll = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("upload");
    setExtracted(null);
    setAnalysis(null);
    setSelectedClause(null);
    setScript(null);
    setSparringMessages([]);
    setError(null);
  }, []);

  const handleExtracted = useCallback((text: string, pages?: number) => {
    setExtracted({ text, pages });
    setPhase("preview");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!extracted) return;

    setPhase("analyzing");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted.text }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message =
          body?.error ||
          (res.status === 400
            ? "The contract text could not be validated. Please check and try again."
            : "Something went wrong analyzing your contract. Please try again.");
        throw new Error(message);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data as ContractAnalysis;
      setAnalysis(result);
      setPhase("analysis");
      setHistory((prev) => [
        {
          title: result.contractType.replace(/_/g, ' '),
          timestamp: new Date(),
          analysis: result,
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      if (controller.signal.aborted && phase === "analyzing") {
        // User cancelled or timeout — only update if still in analyzing phase
        const isTimeout =
          err instanceof DOMException && err.name === "AbortError";
        if (isTimeout && !abortRef.current) {
          // User-initiated cancel — handled by handleCancel
          return;
        }
        setError(
          "The analysis timed out. The contract may be too complex. Please try again."
        );
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Could not connect to the server. Please check your connection and try again."
        );
        console.error("[ContractSection] Network error during analysis:", err.message);
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("[ContractSection] Analysis error:", err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
        console.error("[ContractSection] Unknown analysis error:", err);
      }
      setPhase("error");
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
    }
  }, [extracted, phase]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("preview");
  }, []);

  const handleRetry = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  const handleStartSparring = useCallback((clause: Clause) => {
    setSelectedClause(clause);
    setPhase("sparring-choose");
  }, []);

  const handleBackToAnalysis = useCallback(() => {
    setSelectedClause(null);
    setScript(null);
    setSparringMessages([]);
    setPhase("analysis");
  }, []);

  const handleLoadFromHistory = useCallback((entry: HistoryEntry) => {
    setAnalysis(entry.analysis);
    setSelectedClause(null);
    setScript(null);
    setSparringMessages([]);
    setPhase("analysis");
  }, []);

  const handleGetScript = useCallback(
    async (messages: Array<{ role: string; content: string }>) => {
      if (!selectedClause || !analysis) return;

      setSparringMessages(messages);
      setPhase("generating-script");
      setError(null);

      try {
        const res = await fetch("/api/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clause: selectedClause,
            messages,
            contractType: analysis.contractType,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to generate script.");
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setScript(data as NegotiationScript);
        setPhase("script");
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred generating your script.";
        console.error("[ContractSection] Script generation error:", msg);
        setError(msg);
        setPhase("error");
      }
    },
    [selectedClause, analysis]
  );

  // ── Render by phase ──────────────────────────────────────────────────────

  if (phase === "analyzing") {
    return <AnalysisLoading onCancel={handleCancel} />;
  }

  if (phase === "generating-script") {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <p className="text-sm font-medium text-foreground">
            Generating your cheat sheet…
          </p>
        </div>
        <p className="text-xs text-muted">
          Analyzing your sparring session and crafting actionable talking points
        </p>
      </motion.div>
    );
  }

  if (phase === "script" && script && selectedClause) {
    return (
      <ScriptCard
        script={script}
        clauseTitle={selectedClause.title}
        severity={selectedClause.severity}
        onBackToAnalysis={handleBackToAnalysis}
        onPracticeAnother={handleBackToAnalysis}
      />
    );
  }

  if (phase === "sparring-choose" && selectedClause) {
    return (
      <motion.div
        className="flex flex-col items-center py-16 px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Mode</h2>
        <p className="text-sm text-muted mb-8 text-center max-w-md">
          Practice negotiating <span className="font-semibold text-foreground">{selectedClause.title}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <button
            onClick={() => setPhase("sparring")}
            className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/60 backdrop-blur-sm p-6 hover:shadow-md transition-all cursor-pointer text-center group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Text Chat</h3>
            <p className="text-xs text-muted">Type your arguments. Read AI responses and coaching notes.</p>
          </button>
          <button
            onClick={() => setPhase("sparring-voice")}
            className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/60 backdrop-blur-sm p-6 hover:shadow-md transition-all cursor-pointer text-center group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Voice Mode</h3>
            <p className="text-xs text-muted">Speak naturally. AI responds with voice and real-time tips.</p>
          </button>
        </div>
        <button
          onClick={handleBackToAnalysis}
          className="mt-6 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          Back to Analysis
        </button>
      </motion.div>
    );
  }

  if (phase === "sparring" && selectedClause && analysis) {
    return (
      <SparringSession
        clause={selectedClause}
        contractType={analysis.contractType}
        onBack={handleBackToAnalysis}
        onGetScript={handleGetScript}
      />
    );
  }

  if (phase === "sparring-voice" && selectedClause && analysis) {
    return (
      <VoiceSparring
        clause={selectedClause}
        contractType={analysis.contractType}
        onBack={handleBackToAnalysis}
        onSwitchToChat={() => setPhase("sparring")}
        onGetScript={handleGetScript}
      />
    );
  }

  if (phase === "analysis" && analysis) {
    return (
      <AnalysisDashboard
        analysis={analysis}
        onStartOver={resetAll}
        onStartSparring={handleStartSparring}
      />
    );
  }

  if (phase === "error") {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 mb-6">
          <AlertCircle className="h-8 w-8 text-danger" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Analysis Failed
        </h3>
        <p className="text-sm text-muted text-center max-w-md mb-8">
          {error}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 cursor-pointer"
          >
            Try Again
          </button>
          <button
            onClick={resetAll}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:border-foreground/30 hover:text-foreground cursor-pointer"
          >
            Start Over
          </button>
        </div>
      </motion.div>
    );
  }

  if (phase === "preview" && extracted) {
    return (
      <ContractPreview
        text={extracted.text}
        pages={extracted.pages}
        onStartOver={resetAll}
        onAnalyze={handleAnalyze}
        analyzing={false}
      />
    );
  }

  return (
    <>
      <ContractUpload
        onTextExtracted={handleExtracted}
      />

      {history.length > 0 && (
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted/60">
            <History className="h-4 w-4" />
            <span>Recent Analyses</span>
            <span className="text-xs text-muted/30">({history.length})</span>
          </div>

          <div className="space-y-2">
            {history.map((entry, i) => (
              <button
                key={`${entry.timestamp.getTime()}-${i}`}
                onClick={() => handleLoadFromHistory(entry)}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl glass-card p-4 text-left transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <History className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize text-foreground">
                    {entry.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted/50">
                    <Clock className="h-3 w-3" />
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' · '}
                    {entry.analysis.clauses.length} clauses
                    {' · '}
                    <span
                      className={
                        entry.analysis.overallRisk === 'high'
                          ? 'text-danger'
                          : entry.analysis.overallRisk === 'medium'
                            ? 'text-warning'
                            : 'text-safe'
                      }
                    >
                      {entry.analysis.overallRisk} risk
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted/60" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
