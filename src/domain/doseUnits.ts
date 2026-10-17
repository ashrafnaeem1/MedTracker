import type { MedicineType } from "./medicine";

interface UnitRule {
  label: string;
  step: number;
  defaultAmount: number;
}

const UNIT_RULES: Record<MedicineType, UnitRule> = {
  Tablet: { label: "Tab(s)", step: 0.5, defaultAmount: 1 },
  Syrup: { label: "ml", step: 10, defaultAmount: 10 },
  Injection: { label: "ml", step: 10, defaultAmount: 10 },
  Drops: { label: "drop(s)", step: 1, defaultAmount: 1 },
  Cream: { label: "", step: 1, defaultAmount: 1 },
  Inhaler: { label: "puff(s)", step: 1, defaultAmount: 1 },
  Other: { label: "", step: 1, defaultAmount: 1 },
};

export function defaultAmount(type: MedicineType): number {
  return UNIT_RULES[type].defaultAmount;
}

export function amountStep(type: MedicineType): number {
  return UNIT_RULES[type].step;
}

export function unitLabel(type: MedicineType): string {
  return UNIT_RULES[type].label;
}

export function hasQuantity(type: MedicineType): boolean {
  return unitLabel(type) !== "";
}

export function formatDose(amount: number, type: MedicineType): string {
  return [String(amount), unitLabel(type)].filter((part) => part !== "").join(" ");
}
