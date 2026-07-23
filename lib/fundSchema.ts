import { z } from "zod";
import { isValidIsinCheckDigit } from "@/lib/isin";

// Validates the shape of every /data/funds/<TICKER>.json file. Per
// docs/InvestorHub-data-strategy.md Section 3, these files are the source
// of truth for fund static data (fees, holdings, allocations) — not a
// database table. This schema is what "Implement data validation" means
// for that data: malformed fund data should fail loudly (at build time, or
// when scripts/update-fund.ts tries to write it), not silently render a
// broken page.
//
// Bounds below are deliberately loose sanity checks (catch a typo like
// "22" instead of "0.22"), not a claim that every real-world value must
// fall in this range — the point is catching mistakes, not modelling
// finance.

export const tickerPattern = /^[A-Z0-9]{2,8}$/;
// Standard 12-character ISIN shape (2-letter country code + 9
// alphanumeric + 1 numeric check digit). The check digit itself is
// verified separately below via isValidIsinCheckDigit (Milestone 7 — this
// comment used to say the opposite; a data-integrity testing pass is what
// closed the gap it was describing).
const isinPattern = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const percentField = z.number().min(0).max(100);

// A "published"/"reviewed" date in the future isn't a freshness signal,
// it's a data-entry mistake (e.g. a typo'd year) — the confidence badge
// logic in lib/confidence.ts assumes these dates are in the past, so
// catching this here rather than letting it silently compute a nonsense
// (or negative) day count is worth the loose sanity check.
function notInFuture(dateIso: string): boolean {
  return dateIso <= new Date().toISOString().slice(0, 10);
}
const notFutureDateField = z
  .string()
  .regex(isoDatePattern, "Expected YYYY-MM-DD")
  .refine(notInFuture, "Date cannot be in the future");

const holdingSchema = z.object({
  name: z.string().min(1),
  weight: percentField,
});

const historyEntrySchema = z.object({
  date: z.string().regex(isoDatePattern, "Expected YYYY-MM-DD"),
  field: z.string().min(1),
  value: z.number(),
  source: z.string().min(1),
});

export const fundSchema = z.object({
  ticker: z
    .string()
    .regex(tickerPattern, "Expected an uppercase ticker, e.g. VWRP"),
  isin: z
    .string()
    .regex(isinPattern, "Expected a 12-character ISIN, e.g. IE00BK5BQT80")
    .refine(isValidIsinCheckDigit, "ISIN check digit does not match"),
  name: z.string().min(1),
  issuer: z.string().min(1),
  // Ongoing Charges Figure, as a percentage (0.19 means 0.19%, not 19%).
  ocf: z.number().min(0).max(5),
  feesSource: z.string().min(1),
  feesPublished: notFutureDateField,
  holdingsSource: z.string().min(1),
  holdingsPublished: notFutureDateField,
  topHoldings: z.array(holdingSchema).min(1),
  sectorAllocation: z.record(z.string(), percentField),
  regionAllocation: z.record(z.string(), percentField),
  lastReviewed: notFutureDateField,
  history: z.array(historyEntrySchema),
});

export type FundHolding = z.infer<typeof holdingSchema>;
export type FundHistoryEntry = z.infer<typeof historyEntrySchema>;
export type FundData = z.infer<typeof fundSchema>;

/**
 * Validates a single fund record, returning a typed, safe-to-use object.
 * Throws with a specific, field-level message on failure rather than
 * letting a malformed file surface as a confusing runtime error deep in a
 * page component.
 */
export function parseFund(raw: unknown, sourceLabel: string): FundData {
  const result = fundSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(`Invalid fund data in ${sourceLabel}:\n${issues}`);
  }
  return result.data;
}
