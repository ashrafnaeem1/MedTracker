import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import type { Repeat } from "../../../domain/medicine";

interface RepeatStepProps {
  repeat: Repeat;
  onChange: (repeat: Repeat) => void;
}

const OPTIONS = [
  { kind: "daily", title: "Every day", detail: "The same doses every day." },
  { kind: "weekly", title: "Certain days", detail: "Pick the days of the week." },
] as const;

export default function RepeatStep({ repeat, onChange }: RepeatStepProps) {
  return (
    <div className="mt-section">
      {OPTIONS.map((option) => {
        const selected = repeat.kind === option.kind;
        const next: Repeat =
          option.kind === "daily"
            ? { kind: "daily" }
            : { kind: "weekly", days: repeat.kind === "weekly" ? repeat.days : [] };
        return (
          <IonCard
            key={option.kind}
            button
            aria-pressed={selected}
            className={`mt-option ${selected ? "mt-option--selected" : ""}`}
            onClick={() => onChange(next)}
          >
            <IonCardContent>
              <IonCardTitle>{option.title}</IonCardTitle>
              <IonCardSubtitle>{option.detail}</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
        );
      })}
    </div>
  );
}
