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
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toIsoDate } from "../../domain/date";
import { requestAdd, requestEdit } from "../../shared/pendingEdit";
import ReminderPrompt from "../../shared/ReminderPrompt";
import { useNow } from "../../shared/useNow";
import DateStrip from "./DateStrip";
import Timeline from "./Timeline";
import { useDaySlots } from "./useDaySlots";
import { useSlotFocus } from "./useSlotFocus";

const FOCUS_DURATION_MS = 10_000;

export default function SchedulePage() {
  const navigate = useNavigate();
  const clock = useNow();
  const today = toIsoDate(clock.now);
  const [selected, setSelected] = useState(today);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const { slots, record, undo, refresh: refreshSlots } = useDaySlots(selected, clock.now);

  const openFromReminder = useCallback(
    (slotKey: string) => {
      const [, date] = slotKey.split("|");
      if (date) {
        setSelected(date);
      }
      setFocusedKey(slotKey);
      navigate("/schedule");
    },
    [navigate],
  );

  useSlotFocus(openFromReminder);

  useEffect(() => {
    if (focusedKey === null) {
      return;
    }
    const scrollTimer = window.setTimeout(() => {
      const element = document.querySelector(`[data-slot-key="${CSS.escape(focusedKey)}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    const clearTimer = window.setTimeout(() => setFocusedKey(null), FOCUS_DURATION_MS);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [focusedKey]);

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
          focusedKey={focusedKey}
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
