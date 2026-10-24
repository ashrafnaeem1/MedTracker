import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { futureReminders } from "../domain/reminders";
import { doseLogRepository } from "../storage/doseLogRepository";
import { medicineRepository } from "../storage/medicineRepository";
import { subscribe } from "./events";

const CHANNEL_ID = "dose-reminders";
const TITLE = "Time for your medicine";
const HORIZON_DAYS = 7;
const STORED_IDS_KEY = "medtracker.nativeReminderIds.v1";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

function notificationId(slotKey: string): number {
  let hash = 5381;
  for (let i = 0; i < slotKey.length; i++) {
    hash = ((hash << 5) + hash + slotKey.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function readStoredIds(): number[] {
  const raw = localStorage.getItem(STORED_IDS_KEY);
  return raw ? (JSON.parse(raw) as number[]) : [];
}

function writeStoredIds(ids: number[]): void {
  localStorage.setItem(STORED_IDS_KEY, JSON.stringify(ids));
}

export async function setupNativeReminders(): Promise<void> {
  if (!isNative()) {
    return;
  }
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Dose reminders",
    description: "Reminds you when a dose is due",
    importance: 4,
    visibility: 1,
    vibration: true,
  });
}

export async function hasNativePermission(): Promise<boolean> {
  if (!isNative()) {
    return false;
  }
  const status = await LocalNotifications.checkPermissions();
  return status.display === "granted";
}

export async function ensureNativePermissions(): Promise<boolean> {
  if (!isNative()) {
    return false;
  }
  if (!(await hasNativePermission())) {
    const requested = await LocalNotifications.requestPermissions();
    if (requested.display !== "granted") {
      return false;
    }
  }
  const exact = await LocalNotifications.checkExactNotificationSetting();
  if (exact.exact_alarm !== "granted") {
    await LocalNotifications.changeExactNotificationSetting();
  }
  return true;
}

export async function syncNativeReminders(): Promise<void> {
  if (!isNative()) {
    return;
  }

  const previousIds = readStoredIds();
  if (previousIds.length > 0) {
    await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) });
  }

  const plans = futureReminders(
    medicineRepository.list(),
    doseLogRepository.list(),
    new Date(),
    HORIZON_DAYS,
  );
  const notifications = plans.map((plan) => ({
    id: notificationId(plan.key),
    title: TITLE,
    body: "",
    channelId: CHANNEL_ID,
    schedule: { at: plan.at, allowWhileIdle: true },
    extra: { slotKey: plan.key },
  }));

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
  writeStoredIds(notifications.map((notification) => notification.id));
}

export function startNativeReminders(): () => void {
  void syncNativeReminders();
  return subscribe(() => {
    void syncNativeReminders();
  });
}
