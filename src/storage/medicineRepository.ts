import { defaultAmount } from "../domain/doseUnits";
import type { Medicine, MedicineType } from "../domain/medicine";

export interface MedicineRepository {
  list(): Medicine[];
  save(medicine: Medicine): void;
  remove(id: string): void;
}

const CURRENT_KEY = "medtracker.medicines.v2";
const LEGACY_KEY = "medtracker.medicines.v1";

interface LegacyMedicine extends Omit<Medicine, "doses"> {
  times: string[];
  type: MedicineType;
}

function readAll(): Medicine[] {
  const current = localStorage.getItem(CURRENT_KEY);
  if (current !== null) {
    return JSON.parse(current) as Medicine[];
  }

  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy === null) {
    return [];
  }

  const migrated = (JSON.parse(legacy) as LegacyMedicine[]).map(migrateLegacy);
  writeAll(migrated);
  return migrated;
}

function migrateLegacy({ times, ...rest }: LegacyMedicine): Medicine {
  return {
    ...rest,
    doses: times.map((time) => ({ time, amount: defaultAmount(rest.type) })),
  };
}

function writeAll(medicines: Medicine[]): void {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(medicines));
}

export const medicineRepository: MedicineRepository = {
  list: readAll,

  save(medicine) {
    const medicines = readAll();
    const index = medicines.findIndex((item) => item.id === medicine.id);
    if (index === -1) {
      medicines.push(medicine);
    } else {
      medicines[index] = medicine;
    }
    writeAll(medicines);
  },

  remove(id) {
    writeAll(readAll().filter((item) => item.id !== id));
  },
};
