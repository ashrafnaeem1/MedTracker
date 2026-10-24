import { IonNote } from "@ionic/react";
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
    <div style={{ padding: 16 }}>
      <p style={{ margin: "0 0 12px", fontSize: 16 }}>Which days should this medicine be taken?</p>
      <div
        role="group"
        aria-label="Days of the week"
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {WEEKDAYS.map((day) => {
          const on = days.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(day)}
              style={{
                minWidth: 56,
                minHeight: 44,
                padding: "0 12px",
                borderRadius: 999,
                border: `1px solid`,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {WEEKDAY_LABELS[day]}
            </button>
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
