import { shiftDate, slotMoment, toIsoDate } from "./date";
import type { DoseLog } from "./doseLog";
import { slotId } from "./doseLog";
import type { Medicine } from "./medicine";
import { appliesOn } from "./repeat";

export interface ReminderPlan {
  key: string;
  at: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 5 * 60 * 1000;

export function upcomingReminders(
  medicines: Medicine[],
  logs: DoseLog[],
  now: Date,
): ReminderPlan[] {
  const loggedKeys = new Set(logs.map((log) => log.id));
  const today = toIsoDate(now);
  const plans: ReminderPlan[] = [];

  for (const date of [today, shiftDate(today, 1)]) {
    for (const medicine of medicines) {
      if (!appliesOn(medicine.repeat, date)) {
        continue;
      }
      for (const dose of medicine.doses) {
        if (dose.time === "") {
          continue;
        }
        const key = slotId({ medicineId: medicine.id, date, time: dose.time });
        const at = slotMoment(date, dose.time);
        const untilDue = at.getTime() - now.getTime();
        if (untilDue <= -GRACE_MS || untilDue > DAY_MS || loggedKeys.has(key)) {
          continue;
        }
        plans.push({ key, at });
      }
    }
  }

  return plans;
}
