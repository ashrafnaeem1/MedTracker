import { IonChip, IonNote } from "@ionic/react";
import { WEEKDAYS, type Weekday } from "../../../domain/medicine";
import { WEEKDAY_LABELS } from "../../../domain/repeat";

interface DaysStepProps {
  days: Weekday[];
  error?: string;
  onChange: (days: Weekday[]) => void;
}

export default function DaysStep({ days, error, onChange }: DaysStepProps) {
  function toggle(day: Weekday) {
    onChange(days.includes(day) ? days.filter((item) => item !== day) : [...days, day]);
  }

  return (
    <div className="mt-section">
      <IonNote>Which days should this medicine be taken?</IonNote>
      <div
        role="group"
        aria-label="Days of the week"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
      >
        {WEEKDAYS.map((day) => {
          const on = days.includes(day);
          return (
            <IonChip
              key={day}
              role="checkbox"
              aria-checked={on}
              color={on ? "primary" : "medium"}
              outline={!on}
              onClick={() => toggle(day)}
            >
              {WEEKDAY_LABELS[day]}
            </IonChip>
          );
        })}
      </div>
      {error && (
        <IonNote color="danger" style={{ display: "block", paddingTop: 12 }}>
          {error}
        </IonNote>
      )}
    </div>
  );
}
