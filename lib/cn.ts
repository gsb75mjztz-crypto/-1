// Milestone 2 audit fix: this exact `[...].filter(Boolean).join(" ")`
// className-merge idiom was hand-rolled identically in Button, Card, and
// Input. Extracted once so a fourth component doesn't reimplement it again.
export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}
