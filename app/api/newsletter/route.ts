import { NextResponse } from "next/server";

// Route scaffolding only — per the Development Roadmap this is a Week 5
// feature. Double opt-in newsletter capture (FR-9) is deliberately not
// implemented in this foundation milestone.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — see Development Roadmap, Week 5." },
    { status: 501 },
  );
}
