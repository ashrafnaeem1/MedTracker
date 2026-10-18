import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { todayOutline } from "ionicons/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAdd, requestEdit } from "../../shared/pendingEdit";
import { toIsoDate } from "../../domain/date";
import { useNow } from "../../shared/useNow";
import ReminderPrompt from "../../shared/ReminderPrompt";
import DateStrip from "./DateStrip";
import Timeline from "./Timeline";
import { useDaySlots } from "./useDaySlots";

export default function SchedulePage() {
  const navigate = useNavigate();
  const clock = useNow();
  const today = toIsoDate(clock.now);
  const [selected, setSelected] = useState(today);
  const { slots, record, undo, refresh: refreshSlots } = useDaySlots(selected, clock.now);

  useIonViewWillEnter(() => {
    clock.refresh();
    refreshSlots();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Schedule</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <DateStrip selected={selected} today={today} onChange={setSelected} />
        <ReminderPrompt />
        <Timeline
          slots={slots}
          today={today}
          onRecord={record}
          onUndo={undo}
          onEdit={(medicineId) => {
            requestEdit(medicineId);
            navigate("/medicines");
          }}
          onAdd={() => {
            requestAdd();
            navigate("/medicines");
          }}
        />
      </IonContent>

      {selected !== today && (
        <IonFooter>
          <IonToolbar style={{ padding: 8 }}>
            <IonButton
              expand="block"
              fill="outline"
              style={{ minHeight: 44 }}
              onClick={() => setSelected(today)}
            >
              <IonIcon slot="start" icon={todayOutline} aria-hidden="true" />
              Back to today
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
}
