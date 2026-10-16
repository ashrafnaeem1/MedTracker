const SUFFIXES = ["th", "st", "nd", "rd"];

export function ordinal(n: number): string {
  const lastTwoDigits = n % 100;
  const isTeen = lastTwoDigits >= 11 && lastTwoDigits <= 13;
  const suffix = isTeen ? "th" : (SUFFIXES[n % 10] ?? "th");
  return `${n}${suffix}`;
}
