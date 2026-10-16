import { IonButton, IonIcon, IonInput } from "@ionic/react";
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
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <IonButton fill="clear" aria-label="Decrease quantity" onClick={() => nudge(-1)}>
        <IonIcon icon={removeOutline} />
      </IonButton>
      <IonInput
        type="number"
        inputmode="decimal"
        name={fieldId}
        aria-label="Quantity"
        value={amount}
        style={{ width: 64, textAlign: "center" }}
        onIonInput={(event) => {
          const parsed = Number(event.detail.value);
          onChange(Number.isNaN(parsed) ? 0 : parsed);
        }}
      />
      <IonButton fill="clear" aria-label="Increase quantity" onClick={() => nudge(1)}>
        <IonIcon icon={addOutline} />
      </IonButton>
      {label !== "" && <span>{label}</span>}
    </div>
  );
}
