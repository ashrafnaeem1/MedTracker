import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from "@ionic/react";
import { removeCircleOutline } from "ionicons/icons";
import { hasQuantity } from "../../domain/doseUnits";
import { markRequired } from "../../shared/requiredMark";
import type { Dose, MedicineType } from "../../domain/medicine";
import { defaultDoseLabel } from "../../domain/doseLabel";
import { formatTime } from "../../domain/time";
import QuantityStepper from "./QuantityStepper";

interface DoseRowProps {
  position: number;
  dose: Dose;
  type: MedicineType;
  canRemove: boolean;
  onLabelChange: (label: string) => void;
  onPickTime: () => void;
  onAmountChange: (amount: number) => void;
  onRemove: () => void;
}

export default function DoseRow({
  position,
  dose,
  type,
  canRemove,
  onLabelChange,
  onPickTime,
  onAmountChange,
  onRemove,
}: DoseRowProps) {
  return (
    <IonItem lines="full">
      <div style={{ width: "100%", padding: "8px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <IonInput
            name={`dose-${position}-label`}
            aria-label="Dose name"
            placeholder={defaultDoseLabel(position)}
            value={dose.label ?? ""}
            onIonInput={(event) => onLabelChange(event.detail.value ?? "")}
          />
          <IonButton fill="clear" onClick={onPickTime}>
            {dose.time ? formatTime(dose.time) : markRequired("Set time")}
          </IonButton>
          {canRemove && (
            <IonButton fill="clear" aria-label="Remove dose" onClick={onRemove}>
              <IonIcon icon={removeCircleOutline} />
            </IonButton>
          )}
        </div>
        {hasQuantity(type) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IonLabel color="medium">Quantity</IonLabel>
            <QuantityStepper
              fieldId={`dose-${position}-quantity`}
              type={type}
              amount={dose.amount}
              onChange={onAmountChange}
            />
          </div>
        )}
      </div>
    </IonItem>
  );
}
