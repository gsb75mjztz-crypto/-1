// ISIN check-digit validation (modified Luhn algorithm, ISO 6166) — the
// one thing lib/fundSchema.ts's isinPattern explicitly documented as NOT
// checking ("this does not verify the Luhn-style check digit itself").
// Catches a transposed or mistyped character in a fund's ISIN that would
// otherwise pass the format-only regex silently — exactly the class of
// data-entry mistake scripts/update-fund.ts and the fund JSON files exist
// to guard against (see lib/fundSchema.ts's own stated purpose).
//
// Algorithm: letters convert to two digits each (A=10 ... Z=35), the
// resulting digit string (everything except the check digit itself) is
// Luhn-summed from the right with every second digit doubled (and
// digit-summed if the double exceeds 9), and the check digit is whatever
// makes the total a multiple of 10.
export function isValidIsinCheckDigit(isin: string): boolean {
  if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)) return false;

  const body = isin.slice(0, -1);
  const checkDigit = Number(isin.slice(-1));

  let digits = "";
  for (const char of body) {
    digits += /[A-Z]/.test(char)
      ? String(char.charCodeAt(0) - "A".charCodeAt(0) + 10)
      : char;
  }

  let total = 0;
  let double = true; // the rightmost digit of `digits` is doubled first
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    total += d;
    double = !double;
  }

  const computedCheckDigit = (10 - (total % 10)) % 10;
  return computedCheckDigit === checkDigit;
}
