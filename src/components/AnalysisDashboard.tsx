"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowDown,
} from "lucide-react";
import type { ContractAnalysis, Clause } from "@/lib/types";
import TopThreeFight from "./TopThreeFight";
import RealCostPanel from "./RealCostPanel";
import ClauseCard from "./ClauseCard";
import RadialOrbitalTimeline from "./ui/RadialOrbitalTimeline";

// ─── Animation Variants ───────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  employment: "Employment Contract",
  independent_contractor: "Independent Contractor",
  freelance: "Freelance Agreement",
  gig_work: "Gig Work Contract",
  consulting: "Consulting Agreement",
  nda: "Non-Disclosure Agreement",
  non_compete: "Non-Compete Agreement",
  service_agreement: "Service Agreement",
  other: "Contract",
};

const RISK_STYLES: Record<
  string,
  { badge: string; glow: string; label: string; icon: typeof ShieldAlert }
> = {
  high: {
    badge: "bg-danger/15 text-danger-light border-danger/30",
    glow: "glow-danger",
    label: "High Risk",
    icon: ShieldAlert,
  },
  medium: {
    badge: "bg-warning/15 text-warning-light border-warning/30",
    glow: "glow-warning",
    label: "Medium Risk",
    icon: Shield,
  },
  low: {
    badge: "bg-safe/15 text-safe-light border-safe/30",
    glow: "glow-safe",
    label: "Low Risk",
    icon: ShieldCheck,
  },
};

const SEVERITY_ORDER: Record<string, number> = { red: 0, amber: 1, green: 2 };

// ─── useCountUp Hook ──────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start: number | null = null;
    let raf: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

const DONUT_RADIUS = 70;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/** Build a semicircular arc path from startAngle to endAngle (degrees, 0 = top, clockwise). */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AnalysisDashboardProps {
  analysis: ContractAnalysis;
  onStartOver: () => void;
  onStartSparring?: (clause: Clause) => void;
}

export default function AnalysisDashboard({
  analysis,
  onStartOver,
  onStartSparring,
}: AnalysisDashboardProps) {
  const risk = RISK_STYLES[analysis.overallRisk] ?? RISK_STYLES.medium;
  const [severityFilter, setSeverityFilter] = useState<"red" | "amber" | "green" | null>(null);
  const clausesSectionRef = useRef<HTMLElement>(null);

  const sortedClauses = [...analysis.clauses].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2)
  );

  const visibleClauses = severityFilter
    ? sortedClauses.filter((c) => c.severity === severityFilter)
    : sortedClauses;

  function handleStatClick(severity: "red" | "amber" | "green" | null) {
    setSeverityFilter(severity);
    setTimeout(() => {
      if (!clausesSectionRef.current) return;
      const rect = clausesSectionRef.current.getBoundingClientRect();
      const HEADER_OFFSET = 80; // sticky header height + breathing room
      window.scrollTo({ top: window.scrollY + rect.top - HEADER_OFFSET, behavior: "smooth" });
    }, 50);
  }

  // Severity counts
  const counts = useMemo(() => {
    const c = { red: 0, amber: 0, green: 0 };
    for (const clause of analysis.clauses) {
      if (clause.severity in c) c[clause.severity as keyof typeof c]++;
    }
    return c;
  }, [analysis.clauses]);

  const total = analysis.clauses.length;
  const animatedTotal = useCountUp(total);
  const animatedRed = useCountUp(counts.red);
  const animatedAmber = useCountUp(counts.amber);
  const animatedGreen = useCountUp(counts.green);

  // Donut segment offsets
  const donutSegments = useMemo(() => {
    if (total === 0) return [];
    const redFrac = counts.red / total;
    const amberFrac = counts.amber / total;
    const greenFrac = counts.green / total;
    let cumulative = 0;
    const segments: Array<{
      color: string;
      fraction: number;
      offset: number;
      label: string;
      count: number;
    }> = [];
    if (counts.red > 0) {
      segments.push({ color: "#ef4444", fraction: redFrac, offset: cumulative, label: "Dangerous", count: counts.red });
      cumulative += redFrac;
    }
    if (counts.amber > 0) {
      segments.push({ color: "#f59e0b", fraction: amberFrac, offset: cumulative, label: "Concerning", count: counts.amber });
      cumulative += amberFrac;
    }
    if (counts.green > 0) {
      segments.push({ color: "#22c55e", fraction: greenFrac, offset: cumulative, label: "Fair", count: counts.green });
    }
    return segments;
  }, [counts, total]);

  // Risk gauge parameters
  const gauge = useMemo(() => {
    const level = analysis.overallRisk;
    const fillPercent = level === "high" ? 0.8 : level === "medium" ? 0.5 : 0.25;
    const color = level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#22c55e";
    const label = level === "high" ? "High Risk" : level === "medium" ? "Medium Risk" : "Low Risk";
    // Semicircle goes from 180° to 0° (left to right)
    const endAngle = 180 + fillPercent * 180;
    return { fillPercent, color, label, endAngle };
  }, [analysis.overallRisk]);

  // Stats config
  const stats = [
    { label: "Total Clauses", value: animatedTotal, icon: FileText, colorClass: "bg-accent/15 text-accent", severity: null as null, clickable: false },
    { label: "Issues", value: animatedRed, icon: AlertTriangle, colorClass: "bg-danger/15 text-danger-light", severity: "red" as const, clickable: true },
    { label: "Warnings", value: animatedAmber, icon: Shield, colorClass: "bg-warning/15 text-warning-light", severity: "amber" as const, clickable: true },
    { label: "Fair", value: animatedGreen, icon: CheckCircle2, colorClass: "bg-safe/15 text-safe-light", severity: "green" as const, clickable: true },
  ];

  return (
    <motion.div
      className="space-y-10"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Stats Row ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const isActive = severityFilter === s.severity && s.clickable;
          const card = (
            <div
              className={`glass-card rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all duration-200 ${
                s.clickable
                  ? "cursor-pointer hover:scale-[1.03] hover:brightness-110 select-none"
                  : ""
              } ${isActive ? "ring-2 ring-white/20 brightness-110 scale-[1.03]" : ""}`}
            >
              <div className={`rounded-full p-2 ${s.colorClass}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted">{s.label}</span>
              {s.clickable && (
                <ArrowDown
                  className={`h-3 w-3 transition-all duration-300 ${
                    isActive
                      ? "text-foreground/60 translate-y-0.5"
                      : "text-muted/40 animate-bounce"
                  }`}
                />
              )}
            </div>
          );
          return s.clickable ? (
            <button
              key={s.label}
              onClick={() => handleStatClick(isActive ? null : s.severity)}
              className="text-left"
            >
              {card}
            </button>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </motion.div>

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
        {/* Severity Donut */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Severity Breakdown</h3>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 200 200" className="w-40 h-40">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={DONUT_RADIUS}
                fill="none"
                stroke="currentColor"
                className="text-surface-light/40"
                strokeWidth="24"
              />
              {/* Segments */}
              {donutSegments.map((seg, i) => (
                <motion.circle
                  key={seg.label}
                  cx="100"
                  cy="100"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="24"
                  strokeLinecap="butt"
                  strokeDasharray={`${seg.fraction * DONUT_CIRCUMFERENCE} ${DONUT_CIRCUMFERENCE}`}
                  strokeDashoffset={-seg.offset * DONUT_CIRCUMFERENCE}
                  transform="rotate(-90 100 100)"
                  initial={{ strokeDasharray: `0 ${DONUT_CIRCUMFERENCE}` }}
                  animate={{
                    strokeDasharray: `${seg.fraction * DONUT_CIRCUMFERENCE} ${DONUT_CIRCUMFERENCE}`,
                  }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                />
              ))}
              {/* Center text */}
              <text
                x="100"
                y="95"
                textAnchor="middle"
                className="fill-foreground text-3xl font-bold"
                style={{ fontSize: "32px", fontWeight: 700 }}
              >
                {total}
              </text>
              <text
                x="100"
                y="116"
                textAnchor="middle"
                className="fill-muted"
                style={{ fontSize: "12px" }}
              >
                clauses
              </text>
            </svg>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-1.5 text-xs text-muted">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  {seg.label} {seg.count}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Gauge */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Overall Risk</h3>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 200 120" className="w-48 h-28">
              {/* Background arc */}
              <path
                d={describeArc(100, 110, 80, 180, 360)}
                fill="none"
                stroke="currentColor"
                className="text-surface-light/40"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Foreground arc — animated */}
              <motion.path
                d={describeArc(100, 110, 80, 180, gauge.endAngle)}
                fill="none"
                stroke={gauge.color}
                strokeWidth="16"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              />
              {/* End indicator dot */}
              <motion.circle
                cx={100 + 80 * Math.cos(((gauge.endAngle - 90) * Math.PI) / 180)}
                cy={110 + 80 * Math.sin(((gauge.endAngle - 90) * Math.PI) / 180)}
                r="6"
                fill={gauge.color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.4 }}
              />
              {/* Center label */}
              <text
                x="100"
                y="105"
                textAnchor="middle"
                style={{ fontSize: "14px", fontWeight: 600 }}
                fill={gauge.color}
              >
                {gauge.label}
              </text>
            </svg>
            {/* Scale labels */}
            <div className="flex justify-between w-48 text-[10px] text-muted -mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Orbital Clause Map ──────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Clause Map</h3>
          <span className="text-xs text-muted/50">Click a node to inspect</span>
        </div>
        <RadialOrbitalTimeline
          items={analysis.clauses.map((clause, i) => ({
            id: i,
            title: clause.title,
            severity: clause.severity,
            content: clause.explanation,
          }))}
          onItemClick={onStartSparring ? (item) => {
            const clause = analysis.clauses[item.id];
            if (clause && clause.severity !== 'green') onStartSparring(clause);
          } : undefined}
        />
      </motion.div>

      {/* ── Header: contract type + risk badge + start over ──────── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {CONTRACT_TYPE_LABELS[analysis.contractType] ?? "Contract"} Analysis
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${risk.badge} ${risk.glow}`}
          >
            <risk.icon className="h-3 w-3" />
            {risk.label}
          </span>
        </div>
        <button
          onClick={onStartOver}
          className="rounded-xl glass-card-interactive px-5 py-2 text-sm text-muted hover:text-foreground cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Start Over
        </button>
      </motion.div>

      {/* ── Summary ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 sm:p-6">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {analysis.summary}
        </p>
      </motion.div>

      {/* ── Top 3 to Fight ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <TopThreeFight analysis={analysis} />
      </motion.div>

      {/* ── Real Cost ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <RealCostPanel realCost={analysis.realCost} />
      </motion.div>

      {/* ── All Clauses ────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} ref={clausesSectionRef}>
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {severityFilter === "red"
              ? "Issues"
              : severityFilter === "amber"
              ? "Warnings"
              : severityFilter === "green"
              ? "Fair Clauses"
              : "All Clauses"}
          </h2>
          <span className="inline-flex items-center rounded-full bg-surface-light/60 px-2.5 py-0.5 text-xs font-medium text-muted">
            {visibleClauses.length}
          </span>
          {severityFilter && (
            <button
              onClick={() => setSeverityFilter(null)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-light/40 px-3 py-1 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              Show all
            </button>
          )}
        </div>
        <motion.div
          key={severityFilter ?? "all"}
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.1 },
            },
          }}
        >
          {visibleClauses.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted">
              No clauses in this category.
            </div>
          ) : (
            visibleClauses.map((clause, i) => (
              <ClauseCard
                key={`${clause.title}-${i}`}
                clause={clause}
                index={i}
                onPractice={
                  onStartSparring ? () => onStartSparring(clause) : undefined
                }
              />
            ))
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
