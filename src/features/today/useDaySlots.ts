import { useCallback, useState } from "react";
import { buildDaySlots } from "../../domain/daySchedule";
import type { RecordedStatus, SlotRef } from "../../domain/doseLog";
import { appActions } from "../../shared/actions";
import { doseLogRepository } from "../../storage/doseLogRepository";
import { medicineRepository } from "../../storage/medicineRepository";

export function useDaySlots(date: string, now: Date) {
  const [_version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);

  const slots = buildDaySlots(medicineRepository.list(), doseLogRepository.list(), date, now);

  function record(ref: SlotRef, status: RecordedStatus) {
    appActions.recordDose(ref, status);
    refresh();
  }

  function undo(ref: SlotRef) {
    appActions.undoDose(ref);
    refresh();
  }

  return { slots, record, undo, refresh };
}
