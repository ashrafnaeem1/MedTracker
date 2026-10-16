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

export interface Medicine {
  id: string;
  name: string;
  formula: string;
  type: MedicineType;
  times: string[];
  createdAt: string;
  updatedAt: string;
}

export type MedicineDraft = Pick<Medicine, "name" | "formula" | "type" | "times">;

export type MedicineErrors = Partial<Record<"name" | "times", string>>;

export function validateDraft(draft: MedicineDraft): MedicineErrors {
  const errors: MedicineErrors = {};

  if (draft.name.trim() === "") {
    errors.name = "Please enter a name";
  }

  if (draft.times.length === 0 || draft.times.some((time) => time === "")) {
    errors.times = "Every dose needs a time";
  } else if (new Set(draft.times).size !== draft.times.length) {
    errors.times = "Two doses cannot share the same time";
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
    times: [...draft.times].sort(),
  };
}
