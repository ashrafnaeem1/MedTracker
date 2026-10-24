import { IonButton, IonIcon, IonInput, IonItem } from "@ionic/react";
import { createOutline, removeCircleOutline } from "ionicons/icons";
import { useRef, type CSSProperties } from "react";
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

const TIME_COLUMN_MIN = 144;
const REMOVE_COLUMN_WIDTH = 44;

const ROW_GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `minmax(0, 1fr) minmax(${TIME_COLUMN_MIN}px, auto) ${REMOVE_COLUMN_WIDTH}px`,
  alignItems: "center",
  columnGap: 8,
};

const NAME_FIELD: CSSProperties = {
  minWidth: 0,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "0 10px",
  borderRadius: 10,
  cursor: "text",
};

const NAME_INPUT: CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: 16,
  fontWeight: 600,
};

const TIME_BUTTON_BASE: CSSProperties = {
  justifySelf: "stretch",
  minWidth: TIME_COLUMN_MIN,
  minHeight: 44,
  padding: "0 8px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
  textAlign: "center",
  boxSizing: "border-box",
};

const TIME_SET: CSSProperties = {
  ...TIME_BUTTON_BASE,
  border: "1px solid",
};

const TIME_UNSET: CSSProperties = {
  ...TIME_BUTTON_BASE,
  border: "1px solid",
};

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
      <div style={{ width: "100%", padding: "10px 0", display: "grid", rowGap: 8 }}>
        <div style={ROW_GRID}>
          <div style={NAME_FIELD} onClick={() => nameInput.current?.setFocus()}>
            <IonInput
              ref={nameInput}
              className="dose-name-input"
              name={`dose-${position}-label`}
              aria-label={`Name for ${defaultDoseLabel(position)}`}
              placeholder={defaultDoseLabel(position)}
              value={dose.label ?? ""}
              style={NAME_INPUT}
              onIonInput={(event) => onLabelChange(event.detail.value ?? "")}
            />
            <IonIcon
              icon={createOutline}
              aria-hidden="true"
              style={{ fontSize: 18, flexShrink: 0 }}
            />
          </div>

          <button type="button" onClick={onPickTime} style={dose.time ? TIME_SET : TIME_UNSET}>
            {dose.time ? formatTime(dose.time) : markRequired("Choose time")}
          </button>

          {canRemove ? (
            <IonButton
              fill="clear"
              aria-label="Remove dose"
              onClick={onRemove}
              style={{ width: REMOVE_COLUMN_WIDTH, minHeight: 44, margin: 0 }}
            >
              <IonIcon slot="icon-only" icon={removeCircleOutline} />
            </IonButton>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>

        {hasQuantity(type) && (
          <div style={ROW_GRID}>
            <span style={{ fontSize: 14, paddingLeft: 10, whiteSpace: "nowrap" }}>Quantity</span>
            <div
              style={{
                gridColumn: "2 / span 2",
                display: "flex",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <QuantityStepper
                fieldId={`dose-${position}-quantity`}
                type={type}
                amount={dose.amount}
                onChange={onAmountChange}
              />
            </div>
          </div>
        )}
      </div>
    </IonItem>
  );
}
