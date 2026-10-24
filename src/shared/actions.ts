import type { Medicine } from "../domain/medicine";
import { createLog, slotId, type RecordedStatus, type SlotRef } from "../domain/doseLog";
import { publish } from "./events";
import { doseLogRepository } from "../storage/doseLogRepository";
import { medicineRepository } from "../storage/medicineRepository";

export const appActions = {
  saveMedicine(medicine: Medicine): void {
    medicineRepository.save(medicine);
    publish({ type: "medicine:saved", medicine });
  },

  removeMedicine(medicineId: string): void {
    medicineRepository.remove(medicineId);
    publish({ type: "medicine:removed", medicineId });
  },

  recordDose(ref: SlotRef, status: RecordedStatus, now: Date = new Date()): void {
    doseLogRepository.save(createLog(ref, status, now));
    publish({ type: "dose:recorded", ref, status });
  },

  undoDose(ref: SlotRef): void {
    doseLogRepository.remove(slotId(ref));
    publish({ type: "dose:undone", ref });
  },
};
