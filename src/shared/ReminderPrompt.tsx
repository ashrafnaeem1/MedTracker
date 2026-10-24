import { IonButton, IonIcon } from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";
import { useState } from "react";
import {
  reminderPermission,
  requestReminderPermission,
  type ReminderPermission,
} from "./reminders";

export default function ReminderPrompt() {
  const [permission, setPermission] = useState<ReminderPermission>(() => reminderPermission());

  if (permission === "granted" || permission === "unsupported") {
    return null;
  }

  if (permission === "denied") {
    return (
      <p style={{ margin: "12px 16px 0", fontSize: 14 }}>
        Dose reminders are off. Turn notifications on for this site in your browser settings.
      </p>
    );
  }

  async function turnOn() {
    setPermission(await requestReminderPermission());
  }

  return (
    <div style={{ padding: "12px 16px 0" }}>
      <IonButton expand="block" fill="outline" style={{ minHeight: 44 }} onClick={turnOn}>
        <IonIcon slot="start" icon={notificationsOutline} aria-hidden="true" />
        Turn on dose reminders
      </IonButton>
    </div>
  );
}
