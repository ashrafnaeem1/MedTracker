import { IonItem, IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
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
  function select(kind: "daily" | "weekly") {
    if (kind === "daily") {
      onChange({ kind: "daily" });
    } else {
      onChange({ kind: "weekly", days: repeat.kind === "weekly" ? repeat.days : [] });
    }
  }

  return (
    <IonRadioGroup value={repeat.kind} onIonChange={(event) => select(event.detail.value)}>
      <IonList>
        {OPTIONS.map((option) => (
          <IonItem key={option.kind} lines="full">
            <IonLabel className="ion-text-wrap">
              <h2>{option.title}</h2>
              <p>{option.detail}</p>
            </IonLabel>
            <IonRadio slot="end" value={option.kind} />
          </IonItem>
        ))}
      </IonList>
    </IonRadioGroup>
  );
}
