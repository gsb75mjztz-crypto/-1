// Matches the ETF Page Build Spec's exact date format throughout the
// template ("Data published: 1 July 2026", "Last reviewed: 15 July
// 2026") — one place so every section renders dates identically.
export function formatDate(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
