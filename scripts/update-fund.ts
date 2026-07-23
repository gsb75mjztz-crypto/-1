import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseFund, tickerPattern } from "@/lib/fundSchema";

// Per docs/InvestorHub-data-strategy.md Section 4:
//   scripts/update-fund.ts --ticker VWRP --field ocf --value 0.22 \
//     --source "Vanguard Official Factsheet"
//
// Updates the current value in /data/funds/<TICKER>.json AND appends to
// its `history` array in the same operation — the doc is explicit that
// this script exists specifically so the append-to-history step can't be
// forgotten the way a hand-edit could. Validates the result against the
// same schema used everywhere else (lib/fundSchema.ts) before writing, so
// a malformed update fails loudly here rather than surfacing as a broken
// page later.
//
// Usage:
//   npm run update-fund -- --ticker VWRP --field ocf --value 0.14 \
//     --source "Vanguard Official Factsheet" [--date 2026-07-28]

const UPDATABLE_FIELDS = new Set(["ocf", "name", "issuer"]);

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg?.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      args[key] = value;
      i += 1;
    }
  }
  return args;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { ticker, field, value, source, date } = args;

  if (!ticker || !field || value === undefined || !source) {
    console.error(
      "Usage: update-fund --ticker <TICKER> --field <field> --value <value> --source <source> [--date YYYY-MM-DD]",
    );
    process.exit(1);
  }

  if (!UPDATABLE_FIELDS.has(field)) {
    console.error(
      `Field "${field}" is not updatable via this script. Updatable fields: ${Array.from(UPDATABLE_FIELDS).join(", ")}. Holdings/allocation changes need a full factsheet re-import, not a single-field update.`,
    );
    process.exit(1);
  }

  // Validate before using the ticker to build a filesystem path — an
  // unchecked value here could otherwise be used to traverse outside
  // data/funds (e.g. "--ticker ../../etc/passwd").
  if (!tickerPattern.test(ticker.toUpperCase())) {
    console.error(
      `"${ticker}" is not a valid ticker (expected 2-8 uppercase letters/digits, e.g. VWRP).`,
    );
    process.exit(1);
  }

  const filePath = join(
    process.cwd(),
    "data",
    "funds",
    `${ticker.toUpperCase()}.json`,
  );
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));

  const effectiveDate = date ?? todayIso();
  const numericValue = Number(value);
  const newValue =
    field === "ocf" && !Number.isNaN(numericValue) ? numericValue : value;

  raw[field] = newValue;
  if (field === "ocf") {
    raw.feesSource = source;
    raw.feesPublished = effectiveDate;
  }
  raw.history = [
    ...raw.history,
    { date: effectiveDate, field, value: newValue, source },
  ];

  // Validate before writing — a bad update should fail here, not silently
  // corrupt the file or surface as a broken page later.
  const validated = parseFund(
    raw,
    `${ticker.toUpperCase()}.json (post-update)`,
  );

  writeFileSync(filePath, JSON.stringify(validated, null, 2) + "\n");
  console.log(
    `Updated ${ticker.toUpperCase()}.json: ${field} -> ${newValue} (${source}, ${effectiveDate})`,
  );
}

main();
