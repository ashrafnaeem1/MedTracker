import { defaultAmount } from "./doseUnits";
import type { Dose, MedicineType } from "./medicine";

export const DOSE_PRESETS = [
  { label: "Once", count: 1 },
  { label: "Twice", count: 2 },
  { label: "Thrice", count: 3 },
] as const;

export function resizeDoses(current: Dose[], count: number, type: MedicineType): Dose[] {
  if (count <= current.length) {
    return current.slice(0, count);
  }

  const added = Array.from({ length: count - current.length }, () => ({
    time: "",
    amount: defaultAmount(type),
  }));

  return [...current, ...added];
}
