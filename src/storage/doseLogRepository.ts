import type { DoseLog } from "../domain/doseLog";

export interface DoseLogRepository {
  list(): DoseLog[];
  save(log: DoseLog): void;
  remove(id: string): void;
}

const STORAGE_KEY = "medtracker.doseLogs.v1";

function readAll(): DoseLog[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as DoseLog[]) : [];
}

function writeAll(logs: DoseLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export const doseLogRepository: DoseLogRepository = {
  list: readAll,

  save(log) {
    writeAll([...readAll().filter((item) => item.id !== log.id), log]);
  },

  remove(id) {
    writeAll(readAll().filter((item) => item.id !== id));
  },
};
