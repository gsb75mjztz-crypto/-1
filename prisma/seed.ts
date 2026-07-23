import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Seeds fund_performance with real, sourced figures for Milestone 3's
// curated funds.
//
// Important honesty note: the schema's `source` column defaults to
// "Financial Modeling Prep" (Technical Architecture Section 3) because
// that's the intended production provider — but that integration is
// explicitly gated on a written licence confirmation that hasn't happened
// yet (Legal Principles Section 5, Data Strategy Section 9). These rows
// were NOT sourced from FMP. Every row below overrides `source` to the
// actual document the figures came from (the same official factsheet PDF
// used for fees/holdings), because Methodology Section 1 is explicit:
// "we never blend sources without saying so." Attaching an FMP citation to
// data that didn't come from FMP would be exactly that.
//
// `marketDataUpdatedAt` is each factsheet's own stated "data as at" date,
// not the date this script was run — the confidence badge measures how
// fresh the underlying market data is, not how recently someone looked at
// it. Because monthly factsheets are the source (not a live daily feed),
// the Performance confidence badge will correctly show Medium (or worse)
// once more than 7 days have passed since that date — this is the system
// working honestly, not a bug. See the Milestone 3 report for detail.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const rows = [
  {
    ticker: "VWRP",
    return1m: -0.85,
    returnYtd: 11.18,
    return1y: 23.58,
    return3y: 19.66,
    return5y: 10.96,
    returnSinceLaunch: 13.16,
    source: "Vanguard Official Factsheet",
    marketDataUpdatedAt: new Date("2026-06-30T00:00:00Z"),
  },
  {
    ticker: "VUAG",
    return1m: -0.97,
    returnYtd: 10.08,
    return1y: 22.03,
    return3y: 20.3,
    return5y: 13.09,
    returnSinceLaunch: 16.08,
    source: "Vanguard Official Factsheet",
    marketDataUpdatedAt: new Date("2026-06-30T00:00:00Z"),
  },
  {
    ticker: "HMWO",
    return1m: -0.7,
    returnYtd: 9.71,
    return1y: 21.41,
    return3y: 19.31,
    return5y: 11.62,
    // Not available in the source factsheet in this exact form (it shows
    // 10-year annualised, not "since inception" as a distinct figure) --
    // left null rather than substituting the 10-year figure or inventing
    // one. The UI must render this as "not available", not as a blank
    // that looks like an oversight.
    returnSinceLaunch: null,
    source: "HSBC Official Factsheet",
    marketDataUpdatedAt: new Date("2026-06-30T00:00:00Z"),
  },
];

async function main() {
  for (const row of rows) {
    await prisma.fundPerformance.upsert({
      where: { ticker: row.ticker },
      create: row,
      update: row,
    });
    console.log(`Seeded fund_performance for ${row.ticker}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
