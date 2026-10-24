import { useCallback, useState } from "react";
import { buildDaySlots } from "../../domain/daySchedule";
import { createLog, slotId, type RecordedStatus, type SlotRef } from "../../domain/doseLog";
import { doseLogRepository } from "../../storage/doseLogRepository";
import { medicineRepository } from "../../storage/medicineRepository";

export function useDaySlots(date: string, now: Date) {
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);

  const slots = buildDaySlots(medicineRepository.list(), doseLogRepository.list(), date, now);

  function record(ref: SlotRef, status: RecordedStatus) {
    doseLogRepository.save(createLog(ref, status, new Date()));
    refresh();
  }

  function undo(ref: SlotRef) {
    doseLogRepository.remove(slotId(ref));
    refresh();
  }

  return { slots, record, undo, refresh };
}
