import { slotMoment } from "./date";

export type RecordedStatus = "taken" | "missed";
export type SlotStatus = "upcoming" | "unknown" | RecordedStatus;

export interface SlotRef {
  medicineId: string;
  date: string;
  time: string;
}

export interface DoseLog extends SlotRef {
  id: string;
  status: RecordedStatus;
  loggedAt: string;
}

export function slotId(ref: SlotRef): string {
  return `${ref.medicineId}|${ref.date}|${ref.time}`;
}

export function createLog(ref: SlotRef, status: RecordedStatus, now: Date): DoseLog {
  return {
    id: slotId(ref),
    medicineId: ref.medicineId,
    date: ref.date,
    time: ref.time,
    status,
    loggedAt: now.toISOString(),
  };
}

export function slotStatus(ref: SlotRef, log: DoseLog | undefined, now: Date): SlotStatus {
  if (log) {
    return log.status;
  }
  return slotMoment(ref.date, ref.time) > now ? "upcoming" : "unknown";
}
