import { IonIcon, IonInput } from "@ionic/react";
import { addOutline, removeOutline } from "ionicons/icons";
import type { CSSProperties } from "react";
import { amountStep, unitLabel } from "../../domain/doseUnits";
import type { MedicineType } from "../../domain/medicine";

interface QuantityStepperProps {
  fieldId: string;
  type: MedicineType;
  amount: number;
  onChange: (amount: number) => void;
}

const WRAPPER: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const PILL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  border: "1px solid",
  borderRadius: 999,
  padding: "0 4px",
};

const STEP_BUTTON: CSSProperties = {
  width: 44,
  height: 44,
  flexShrink: 0,
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const VALUE_INPUT: CSSProperties = {
  width: 56,
  flexShrink: 0,
  textAlign: "center",
  fontWeight: 600,
};

const UNIT: CSSProperties = {
  fontSize: 14,
  flexShrink: 0,
  whiteSpace: "nowrap",
  overflow: "visible",
};

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
    <div style={WRAPPER}>
      <div style={PILL}>
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => nudge(-1)}
          style={STEP_BUTTON}
        >
          <IonIcon icon={removeOutline} aria-hidden="true" />
        </button>
        <IonInput
          type="number"
          inputmode="decimal"
          name={fieldId}
          aria-label="Quantity"
          value={amount}
          style={VALUE_INPUT}
          onIonInput={(event) => {
            const parsed = Number(event.detail.value);
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
        />
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => nudge(1)}
          style={STEP_BUTTON}
        >
          <IonIcon icon={addOutline} aria-hidden="true" />
        </button>
      </div>
      {label !== "" && <span style={UNIT}>{label}</span>}
    </div>
  );
}
