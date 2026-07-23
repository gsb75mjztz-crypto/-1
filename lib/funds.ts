import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseFund, type FundData } from "@/lib/fundSchema";

// Per Technical Architecture Section 2: "At build time, Next.js reads all
// files in /data/funds to generate ... each fund's static page content via
// SSG." This is that read step — filesystem, not a database table, and not
// an ORM query. Runs at build time (generateStaticParams, page render) and
// in scripts/update-fund.ts, never in the browser.
const FUNDS_DIR = join(process.cwd(), "data", "funds");

let cache: FundData[] | null = null;

function loadAllFunds(): FundData[] {
  if (cache) return cache;

  const files = readdirSync(FUNDS_DIR).filter((f) => f.endsWith(".json"));
  cache = files.map((file) => {
    const raw = JSON.parse(readFileSync(join(FUNDS_DIR, file), "utf-8"));
    return parseFund(raw, `data/funds/${file}`);
  });
  return cache;
}

export function getAllFunds(): FundData[] {
  return loadAllFunds();
}

export function getAllFundTickers(): string[] {
  return loadAllFunds().map((f) => f.ticker);
}

export function getFundByTicker(ticker: string): FundData | undefined {
  return loadAllFunds().find(
    (f) => f.ticker.toLowerCase() === ticker.toLowerCase(),
  );
}
