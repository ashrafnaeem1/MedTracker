export const MEDICINE_TYPES = [
  "Tablet",
  "Syrup",
  "Injection",
  "Drops",
  "Cream",
  "Inhaler",
  "Other",
] as const;

export type MedicineType = (typeof MEDICINE_TYPES)[number];

export interface Dose {
  time: string;
  amount: number;
  label?: string;
}

export interface Medicine {
  id: string;
  name: string;
  formula: string;
  type: MedicineType;
  doses: Dose[];
  createdAt: string;
  updatedAt: string;
}

export type MedicineDraft = Pick<Medicine, "name" | "formula" | "type" | "doses">;

export type MedicineErrors = Partial<Record<"name" | "times" | "amounts", string>>;

export function validateDraft(draft: MedicineDraft): MedicineErrors {
  const errors: MedicineErrors = {};

  if (draft.name.trim() === "") {
    errors.name = "Please enter a name";
  }

  const times = draft.doses.map((dose) => dose.time);
  if (times.length === 0) {
    errors.times = "Choose how often to take it";
  } else if (times.some((time) => time === "")) {
    errors.times = "Every dose needs a time";
  } else if (new Set(times).size !== times.length) {
    errors.times = "Two doses cannot share the same time";
  }

  if (draft.doses.some((dose) => !(dose.amount > 0))) {
    errors.amounts = "Quantity must be more than 0";
  }

  return errors;
}

export function createMedicine(draft: MedicineDraft, now: Date = new Date()): Medicine {
  const stamp = now.toISOString();
  return { id: crypto.randomUUID(), ...normalise(draft), createdAt: stamp, updatedAt: stamp };
}

export function updateMedicine(
  existing: Medicine,
  draft: MedicineDraft,
  now: Date = new Date(),
): Medicine {
  return { ...existing, ...normalise(draft), updatedAt: now.toISOString() };
}

function normalise(draft: MedicineDraft): MedicineDraft {
  return {
    name: draft.name.trim(),
    formula: draft.formula.trim(),
    type: draft.type,
    doses: [...draft.doses]
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((dose) => ({ ...dose, label: dose.label?.trim() || undefined })),
  };
}
