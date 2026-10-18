import { useEffect } from "react";
import { upcomingReminders } from "../domain/reminders";
import { doseLogRepository } from "../storage/doseLogRepository";
import { medicineRepository } from "../storage/medicineRepository";
import { useNow } from "./useNow";

const REMINDER_TITLE = "Time for your medicine";
const ICON_PATH = "/icons/icon-192.png";

const scheduled = new Map<string, number>();

export type ReminderPermission = NotificationPermission | "unsupported";

export function reminderPermission(): ReminderPermission {
  return "Notification" in window ? Notification.permission : "unsupported";
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.requestPermission();
}

async function showReminder(tag: string): Promise<void> {
  scheduled.delete(tag);
  if (doseLogRepository.list().some((log) => log.id === tag)) {
    return;
  }
  const registration =
    "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (registration) {
    await registration.showNotification(REMINDER_TITLE, { tag, icon: ICON_PATH });
    return;
  }
  new Notification(REMINDER_TITLE, { tag, icon: ICON_PATH });
}

export function useReminders(): void {
  const { now } = useNow();
  const minuteKey = now.toISOString().slice(0, 16);

  useEffect(() => {
    if (reminderPermission() !== "granted") {
      return;
    }

    const plans = upcomingReminders(
      medicineRepository.list(),
      doseLogRepository.list(),
      new Date(),
    );
    const wanted = new Set(plans.map((plan) => plan.key));

    for (const [key, timer] of scheduled) {
      if (!wanted.has(key)) {
        window.clearTimeout(timer);
        scheduled.delete(key);
      }
    }

    for (const plan of plans) {
      if (scheduled.has(plan.key)) {
        continue;
      }
      const delay = Math.max(0, plan.at.getTime() - Date.now());
      scheduled.set(
        plan.key,
        window.setTimeout(() => void showReminder(plan.key), delay),
      );
    }
  }, [minuteKey]);
}
