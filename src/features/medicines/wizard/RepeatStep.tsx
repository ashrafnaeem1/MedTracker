import { IonItem, IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import type { Repeat } from "../../../domain/medicine";

interface RepeatStepProps {
  repeat: Repeat;
  onChange: (repeat: Repeat) => void;
}

type RepeatKind = "daily" | "weekly";

const OPTIONS: { kind: RepeatKind; title: string; detail: string }[] = [
  { kind: "daily", title: "Every day", detail: "The same doses every day." },
  { kind: "weekly", title: "Certain days", detail: "Pick the days of the week." },
];

export default function RepeatStep({ repeat, onChange }: RepeatStepProps) {
  function select(kind: RepeatKind) {
    if (kind === "daily") {
      onChange({ kind: "daily" });
    } else {
      onChange({ kind: "weekly", days: repeat.kind === "weekly" ? repeat.days : [] });
    }
  }

  return (
    <IonRadioGroup value={repeat.kind}>
      <IonList>
        {OPTIONS.map((option) => (
          <IonItem
            key={option.kind}
            button
            detail={false}
            lines="full"
            onClick={() => select(option.kind)}
          >
            <IonLabel className="ion-text-wrap">
              <h2>{option.title}</h2>
              <p>{option.detail}</p>
            </IonLabel>
            <IonRadio slot="end" value={option.kind} tabIndex={-1} />
          </IonItem>
        ))}
      </IonList>
    </IonRadioGroup>
  );
}
