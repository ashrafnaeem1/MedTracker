import { IonButton, IonIcon } from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import {
  ensureNativePermissions,
  hasNativePermission,
  isNative,
  syncNativeReminders,
} from "./nativeReminders";
import {
  reminderPermission,
  requestReminderPermission,
  type ReminderPermission,
} from "./reminders";

function NativeReminderPrompt() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    let active = true;
    void hasNativePermission().then((ok) => {
      if (active) {
        setGranted(ok);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (granted) {
    return null;
  }

  async function turnOn() {
    const ok = await ensureNativePermissions();
    setGranted(ok);
    if (ok) {
      void syncNativeReminders();
    }
  }

  return (
    <div style={{ padding: "12px 16px 0" }}>
      <IonButton expand="block" fill="outline" onClick={turnOn}>
        <IonIcon slot="start" icon={notificationsOutline} aria-hidden="true" />
        Turn on dose reminders
      </IonButton>
    </div>
  );
}

function WebReminderPrompt() {
  const [permission, setPermission] = useState<ReminderPermission>(() => reminderPermission());

  if (permission === "granted" || permission === "unsupported") {
    return null;
  }

  if (permission === "denied") {
    return (
      <p style={{ margin: "12px 16px 0" }}>
        Dose reminders are off. Turn notifications on for this site in your browser settings.
      </p>
    );
  }

  async function turnOn() {
    setPermission(await requestReminderPermission());
  }

  return (
    <div style={{ padding: "12px 16px 0" }}>
      <IonButton expand="block" fill="outline" onClick={turnOn}>
        <IonIcon slot="start" icon={notificationsOutline} aria-hidden="true" />
        Turn on dose reminders
      </IonButton>
    </div>
  );
}

export default function ReminderPrompt() {
  return isNative() ? <NativeReminderPrompt /> : <WebReminderPrompt />;
}
