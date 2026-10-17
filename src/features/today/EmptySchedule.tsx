import { IonButton, IonIcon } from "@ionic/react";
import { addOutline, calendarOutline } from "ionicons/icons";

interface EmptyScheduleProps {
  onAdd: () => void;
}

export default function EmptySchedule({ onAdd }: EmptyScheduleProps) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <IonIcon
        icon={calendarOutline}
        aria-hidden="true"
        style={{ fontSize: 56, color: "#4b5563" }}
      />
      <h2 style={{ margin: "16px 0 8px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
        Nothing scheduled
      </h2>
      <p style={{ margin: 0, fontSize: 16, color: "#374151" }}>There are no doses for this day.</p>
      <IonButton style={{ marginTop: 24, minHeight: 44 }} onClick={onAdd}>
        <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
        Add medicine
      </IonButton>
    </div>
  );
}
