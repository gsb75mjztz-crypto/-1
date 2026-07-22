import { NextResponse } from "next/server";

// Route scaffolding only — per the Development Roadmap this is a Week 5
// feature (Save, Account, Newsletter). CRUD against saved_comparisons /
// saved_comparison_funds, and the auth check that guards it, are
// deliberately not implemented in this foundation milestone.
export async function GET() {
  return NextResponse.json(
    { error: "Not implemented yet — see Development Roadmap, Week 5." },
    { status: 501 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — see Development Roadmap, Week 5." },
    { status: 501 },
  );
}
