import { defaultAmount } from "../domain/doseUnits";
import type { Medicine, MedicineType } from "../domain/medicine";

export interface MedicineRepository {
  list(): Medicine[];
  save(medicine: Medicine): void;
  remove(id: string): void;
}

const KEY_V1 = "medtracker.medicines.v1";
const KEY_V2 = "medtracker.medicines.v2";
const KEY_V3 = "medtracker.medicines.v3";

type WithoutRepeat = Omit<Medicine, "repeat">;

interface LegacyV1 extends Omit<Medicine, "doses" | "repeat"> {
  times: string[];
  type: MedicineType;
}

function fromLegacyV1(item: LegacyV1): WithoutRepeat {
  const { times, ...rest } = item;
  return {
    ...rest,
    doses: times.map((time) => ({ time, amount: defaultAmount(rest.type) })),
  };
}

function readAll(): Medicine[] {
  const current = localStorage.getItem(KEY_V3);
  if (current !== null) {
    return JSON.parse(current) as Medicine[];
  }

  const v2 = localStorage.getItem(KEY_V2);
  const v1 = localStorage.getItem(KEY_V1);
  if (v2 === null && v1 === null) {
    return [];
  }

  const stored: WithoutRepeat[] =
    v2 !== null
      ? (JSON.parse(v2) as WithoutRepeat[])
      : (JSON.parse(v1 as string) as LegacyV1[]).map(fromLegacyV1);

  const migrated: Medicine[] = stored.map((item) => ({
    ...item,
    repeat: { kind: "daily" as const },
  }));
  writeAll(migrated);
  return migrated;
}

function writeAll(medicines: Medicine[]): void {
  localStorage.setItem(KEY_V3, JSON.stringify(medicines));
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
