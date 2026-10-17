import { defaultAmount } from "./doseUnits";
import type { Dose, MedicineType } from "./medicine";

export const DOSE_PRESETS = [
  { label: "Once a day", count: 1 },
  { label: "Twice a day", count: 2 },
  { label: "Three times a day", count: 3 },
] as const;

export function resizeDoses(current: Dose[], count: number, type: MedicineType): Dose[] {
  // decreased doses
  if (count <= current.length) {
    return current.slice(0, count);
  }

  // increased doses
  const added = Array.from({ length: count - current.length }, () => ({
    time: "",
    amount: defaultAmount(type),
  }));

  return [...current, ...added];
}
