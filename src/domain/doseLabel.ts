import { ordinal } from "./ordinal";
import type { Dose } from "./medicine";

export function defaultDoseLabel(position: number): string {
  return `${ordinal(position)} dose`;
}

export function doseLabel(dose: Dose, position: number): string {
  const custom = dose.label?.trim();
  return custom ? custom : defaultDoseLabel(position);
}
