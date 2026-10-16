import type { Medicine } from "../domain/medicine";

export interface MedicineRepository {
  list(): Medicine[];
  save(medicine: Medicine): void;
  remove(id: string): void;
}

const STORAGE_KEY = "medtracker.medicines.v1";

function readAll(): Medicine[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Medicine[]) : [];
}

function writeAll(medicines: Medicine[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
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
