import { IonButton, IonChip, IonIcon, IonInput, IonItem, IonNote } from "@ionic/react";
import { createOutline, removeCircleOutline } from "ionicons/icons";
import { useRef } from "react";
import { defaultDoseLabel } from "../../domain/doseLabel";
import { hasQuantity } from "../../domain/doseUnits";
import type { Dose, MedicineType } from "../../domain/medicine";
import { formatTime } from "../../domain/time";
import { markRequired } from "../../shared/requiredMark";
import QuantityStepper from "./QuantityStepper";
import "./DoseRow.css";

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
  const nameInput = useRef<HTMLIonInputElement>(null);

  return (
    <IonItem lines="full">
      <div style={{ width: "100%", padding: "10px 0" }}>
        <div className="mt-dose-grid">
          <IonInput
            ref={nameInput}
            name={`dose-${position}-label`}
            aria-label={`Name for ${defaultDoseLabel(position)}`}
            placeholder={defaultDoseLabel(position)}
            value={dose.label ?? ""}
            fill="outline"
            onIonInput={(event) => onLabelChange(event.detail.value ?? "")}
          >
            <IonIcon slot="end" icon={createOutline} aria-hidden="true" />
          </IonInput>

          <IonChip color={dose.time ? "medium" : "warning"} outline onClick={onPickTime}>
            {dose.time ? formatTime(dose.time) : markRequired("Choose time")}
          </IonChip>

          {canRemove ? (
            <IonButton fill="clear" aria-label="Remove dose" onClick={onRemove}>
              <IonIcon slot="icon-only" icon={removeCircleOutline} />
            </IonButton>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>

        {hasQuantity(type) && (
          <div className="mt-quantity">
            <IonNote>Quantity</IonNote>
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
