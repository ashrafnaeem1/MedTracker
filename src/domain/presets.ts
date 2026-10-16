import { defaultAmount } from "./doseUnits";
import type { Dose, MedicineType } from "./medicine";

export const DOSE_PRESETS = [
  { label: "Once a day", times: ["08:00"] },
  { label: "Twice a day", times: ["08:00", "20:00"] },
  { label: "Three times a day", times: ["08:00", "14:00", "21:00"] },
] as const;

export const NEW_DOSE_TIME = "12:00";

export function dosesForPreset(count: number, type: MedicineType): Dose[] {
  const preset = DOSE_PRESETS[count - 1];
  if (!preset) {
    return [];
  }
  return preset.times.map((time) => ({ time, amount: defaultAmount(type) }));
}

export function resizeDoses(current: Dose[], count: number, type: MedicineType): Dose[] {
  if (count <= current.length) {
    return current.slice(0, count);
  }

  const presetTimes = DOSE_PRESETS[count - 1]?.times ?? [];
  const added: Dose[] = Array.from({ length: count - current.length }, (_, offset) => {
    const position = current.length + offset;
    return { time: presetTimes[position] ?? NEW_DOSE_TIME, amount: defaultAmount(type) };
  });

  return [...current, ...added];
}
