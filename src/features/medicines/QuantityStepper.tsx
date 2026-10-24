import { IonButton, IonIcon, IonInput, IonNote } from "@ionic/react";
import { addOutline, removeOutline } from "ionicons/icons";
import { amountStep, unitLabel } from "../../domain/doseUnits";
import type { MedicineType } from "../../domain/medicine";

interface QuantityStepperProps {
  fieldId: string;
  type: MedicineType;
  amount: number;
  onChange: (amount: number) => void;
}

export default function QuantityStepper({ fieldId, type, amount, onChange }: QuantityStepperProps) {
  const step = amountStep(type);
  const label = unitLabel(type);

  function nudge(direction: 1 | -1) {
    const next = amount + direction * step;
    if (next > 0) {
      onChange(next);
    }
  }

  return (
    <div className="mt-quantity">
      <div className="mt-stepper">
        <IonButton fill="clear" aria-label="Decrease quantity" onClick={() => nudge(-1)}>
          <IonIcon slot="icon-only" icon={removeOutline} />
        </IonButton>
        <IonInput
          type="number"
          inputmode="decimal"
          name={fieldId}
          aria-label="Quantity"
          value={amount}
          className="mt-stepper-input"
          onIonInput={(event) => {
            const parsed = Number(event.detail.value);
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
        />
        <IonButton fill="clear" aria-label="Increase quantity" onClick={() => nudge(1)}>
          <IonIcon slot="icon-only" icon={addOutline} />
        </IonButton>
      </div>
      {label !== "" && <IonNote>{label}</IonNote>}
    </div>
  );
}
