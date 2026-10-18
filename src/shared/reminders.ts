import { useEffect } from "react";
import { upcomingReminders } from "../domain/reminders";
import { doseLogRepository } from "../storage/doseLogRepository";
import { medicineRepository } from "../storage/medicineRepository";
import { useNow } from "./useNow";

const REMINDER_TITLE = "Time for your medicine";
const ICON_PATH = "/icons/icon-192.png";

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
  const stillDue = !doseLogRepository.list().some((log) => log.id === tag);
  if (!stillDue) {
    return;
  }
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
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
    const timers = upcomingReminders(
      medicineRepository.list(),
      doseLogRepository.list(),
      new Date(),
    ).map((plan) =>
      window.setTimeout(() => {
        void showReminder(plan.key);
      }, plan.at.getTime() - Date.now()),
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [minuteKey]);
}
