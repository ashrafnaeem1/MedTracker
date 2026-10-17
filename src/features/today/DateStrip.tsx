import { IonButton, IonIcon } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";
import {
  dayLabel,
  dayOfMonth,
  formatLongDate,
  formatShortWeekday,
  shiftDate,
} from "../../domain/date";
import { PALETTE } from "./palette";

interface DateStripProps {
  selected: string;
  today: string;
  onChange: (iso: string) => void;
}

const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2];

function chipColors(isSelected: boolean, isToday: boolean) {
  if (!isSelected) {
    return { background: "transparent", text: PALETTE.text };
  }
  return isToday ? PALETTE.chipToday : PALETTE.chipOther;
}

export default function DateStrip({ selected, today, onChange }: DateStripProps) {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "12px 8px 0",
        background: PALETTE.surface,
        color: PALETTE.text,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: selected === today ? PALETTE.taken.text : PALETTE.text,
        }}
      >
        {formatLongDate(selected)}
      </h2>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 15,
          fontWeight: 700,
          color: selected === today ? PALETTE.taken.text : PALETTE.mutedText,
        }}
      >
        {dayLabel(selected, today)}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <IonButton
          fill="clear"
          aria-label="Previous day"
          style={{ minWidth: 44, minHeight: 44 }}
          onClick={() => onChange(shiftDate(selected, -1))}
        >
          <IonIcon slot="icon-only" icon={chevronBackOutline} />
        </IonButton>

        <div role="group" aria-label="Choose a day" style={{ display: "flex", gap: 6 }}>
          {VISIBLE_OFFSETS.map((offset) => {
            const iso = shiftDate(selected, offset);
            const isSelected = offset === 0;
            const colors = chipColors(isSelected, iso === today);
            return (
              <button
                key={offset}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${formatShortWeekday(iso)} ${dayOfMonth(iso)}${iso === today ? ", today" : ""}`}
                onClick={() => onChange(iso)}
                style={{
                  minWidth: 48,
                  minHeight: 56,
                  padding: "6px 0",
                  borderRadius: 16,
                  border: isSelected ? "none" : `2px solid transparent`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  background: colors.background,
                  color: colors.text,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 14 }} aria-hidden="true">
                  {formatShortWeekday(iso)}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700 }} aria-hidden="true">
                  {dayOfMonth(iso)}
                </span>
              </button>
            );
          })}
        </div>

        <IonButton
          fill="clear"
          aria-label="Next day"
          style={{ minWidth: 44, minHeight: 44 }}
          onClick={() => onChange(shiftDate(selected, 1))}
        >
          <IonIcon slot="icon-only" icon={chevronForwardOutline} />
        </IonButton>
      </div>
    </section>
  );
}
