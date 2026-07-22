import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route scaffolding only — per the Development Roadmap this is a Week 2
// feature (FMP integration, blocked on the licensing confirmation in
// Week 0 — see Legal Principles Section 5 and Data Strategy Section 9).
// The auth guard below is real: Vercel Cron calls this URL on a public
// route, so it must reject anything that doesn't carry the shared secret,
// even before there's any real work for the handler to do.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Not implemented yet — see Development Roadmap, Week 2." },
    { status: 501 },
  );
}
