import { z } from "zod";

// ─── Severity & Risk Enums ────────────────────────────────────────────────────

export const SeverityEnum = z.enum(["red", "amber", "green"]);
export type Severity = z.infer<typeof SeverityEnum>;

export const RiskLevelEnum = z.enum(["high", "medium", "low"]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const ContractTypeEnum = z.enum([
  "employment",
  "independent_contractor",
  "freelance",
  "gig_work",
  "consulting",
  "nda",
  "non_compete",
  "service_agreement",
  "other",
]);
export type ContractType = z.infer<typeof ContractTypeEnum>;

// ─── Clause Schema ────────────────────────────────────────────────────────────

export const ClauseSchema = z.object({
  title: z.string().describe("Short descriptive title of the clause"),
  severity: SeverityEnum.describe(
    "red = dangerous/exploitative, amber = concerning/unusual, green = standard/fair"
  ),
  explanation: z
    .string()
    .describe(
      "Plain-language explanation of what this clause means for the worker"
    ),
  leverage: z
    .string()
    .describe(
      "Negotiation leverage point: how the worker could push back on this clause"
    ),
  originalText: z
    .string()
    .describe("The relevant excerpt from the original contract text"),
});
export type Clause = z.infer<typeof ClauseSchema>;

// ─── Real Cost Schema ─────────────────────────────────────────────────────────

export const RealCostSchema = z.object({
  hasFinancialImpact: z
    .boolean()
    .describe("Whether this contract has notable financial implications"),
  estimatedCost: z
    .string()
    .optional()
    .describe(
      "Estimated financial impact range if applicable, e.g. '$500-$2,000/year'"
    ),
  explanation: z
    .string()
    .optional()
    .describe("Plain-language explanation of the financial impact"),
});
export type RealCost = z.infer<typeof RealCostSchema>;

// ─── Contract Analysis Schema ─────────────────────────────────────────────────

export const ContractAnalysisSchema = z.object({
  contractType: ContractTypeEnum.describe(
    "The detected type of contract being analyzed"
  ),
  summary: z
    .string()
    .describe(
      "A 2-3 sentence plain-language summary of the contract and its overall implications for the worker"
    ),
  topThreeToFight: z
    .array(z.string())
    .length(3)
    .describe(
      "The top 3 most important clauses the worker should push back on, as short actionable statements"
    ),
  clauses: z
    .array(ClauseSchema)
    .describe("All notable clauses found in the contract"),
  realCost: RealCostSchema.describe(
    "Assessment of the real financial cost/impact of the contract"
  ),
  overallRisk: RiskLevelEnum.describe(
    "Overall risk assessment: high = many dangerous clauses, medium = some concerns, low = mostly fair"
  ),
});
export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;

// ─── Negotiation Script Schema ─────────────────────────────────────────────────

export const NegotiationScriptSchema = z.object({
  title: z.string().describe("Short headline for the cheat sheet, e.g. 'Your Non-Compete Negotiation Script'"),
  bullets: z
    .array(z.string().describe("One actionable negotiation line starting with a bold verb like 'Say:', 'Ask:', or 'Insist:'"))
    .min(1)
    .max(5)
    .describe("Exactly 3 actionable negotiation bullets the worker can use verbatim. Return exactly 3 items."),
  toneTip: z.string().describe("A brief tone/delivery tip for the overall negotiation approach"),
});
export type NegotiationScript = z.infer<typeof NegotiationScriptSchema>;

// ─── Sparring Mode Types ──────────────────────────────────────────────────────

export interface SparringContext {
  /** The clause being negotiated in sparring mode */
  clause: Clause;
  /** Optional contract type for role-appropriate counterparty persona */
  contractType?: string;
}
