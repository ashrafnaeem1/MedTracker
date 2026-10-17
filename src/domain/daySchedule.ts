import { doseLabel } from "./doseLabel";
import { appliesOn } from "./repeat";
import { slotId, slotStatus, type DoseLog, type SlotRef, type SlotStatus } from "./doseLog";
import type { Dose, Medicine } from "./medicine";

export interface SlotView {
  key: string;
  ref: SlotRef;
  medicine: Medicine;
  dose: Dose;
  label: string;
  status: SlotStatus;
  log?: DoseLog;
}

export function buildDaySlots(
  medicines: Medicine[],
  logs: DoseLog[],
  date: string,
  now: Date,
): SlotView[] {
  const logsById = new Map(logs.map((log) => [log.id, log]));
  const slots: SlotView[] = [];

  for (const medicine of medicines) {
    if (!appliesOn(medicine.repeat, date)) {
      continue;
    }
    medicine.doses.forEach((dose, index) => {
      const ref: SlotRef = { medicineId: medicine.id, date, time: dose.time };
      const key = slotId(ref);
      const log = logsById.get(key);
      slots.push({
        key,
        ref,
        medicine,
        dose,
        label: doseLabel(dose, index + 1),
        status: slotStatus(ref, log, now),
        log,
      });
    });
  }

  return slots.sort(
    (a, b) =>
      a.ref.time.localeCompare(b.ref.time) || a.medicine.name.localeCompare(b.medicine.name),
  );
}
