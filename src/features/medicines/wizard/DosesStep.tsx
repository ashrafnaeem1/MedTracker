import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useState } from "react";
import { defaultAmount } from "../../../domain/doseUnits";
import type { Dose, MedicineErrors, MedicineType } from "../../../domain/medicine";
import { DOSE_PRESETS, resizeDoses } from "../../../domain/presets";
import { toClockTime } from "../../../domain/time";
import DoseRow from "../DoseRow";

interface DosesStepProps {
  type: MedicineType;
  doses: Dose[];
  errors: MedicineErrors;
  onChange: (doses: Dose[]) => void;
}

const TIME_PICKER_ANCHOR_DATE = "2000-01-01";

export default function DosesStep({ type, doses, errors, onChange }: DosesStepProps) {
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const [pickerDraft, setPickerDraft] = useState<string | null>(null);

  const pickerValue =
    pickerDraft ?? (pickingIndex !== null ? doses[pickingIndex]?.time : undefined);

  function updateDose(index: number, changes: Partial<Dose>) {
    onChange(doses.map((dose, position) => (position === index ? { ...dose, ...changes } : dose)));
  }

  function removeDose(index: number) {
    onChange(doses.filter((_, position) => position !== index));
  }

  function openPicker(index: number) {
    setPickerDraft(null);
    setPickingIndex(index);
  }

  function addDose() {
    onChange([...doses, { time: "", amount: defaultAmount(type) }]);
    openPicker(doses.length);
  }

  function closePicker() {
    if (pickingIndex === null) {
      return;
    }
    if (pickerDraft !== null) {
      updateDose(pickingIndex, { time: pickerDraft });
    }
    setPickingIndex(null);
  }

  function handleTimeChange(datetimeValue: string) {
    const clock = toClockTime(datetimeValue);
    if (clock) {
      setPickerDraft(clock);
    }
  }

  return (
    <>
      <div style={{ padding: "16px 16px 0" }}>
        <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
          How many times a day?
        </p>
        <IonSegment
          value={doses.length > 0 ? String(doses.length) : undefined}
          onIonChange={(event) => onChange(resizeDoses(doses, Number(event.detail.value), type))}
        >
          {DOSE_PRESETS.map((preset, index) => (
            <IonSegmentButton key={preset.label} value={String(index + 1)}>
              {preset.label}
            </IonSegmentButton>
          ))}
        </IonSegment>
        {errors.times && (
          <IonNote color="danger" style={{ display: "block", paddingTop: 8 }}>
            {errors.times}
          </IonNote>
        )}
        {errors.amounts && (
          <IonNote color="danger" style={{ display: "block", paddingTop: 8 }}>
            {errors.amounts}
          </IonNote>
        )}
      </div>

      <IonList>
        {doses.map((dose, index) => (
          <DoseRow
            key={index}
            position={index + 1}
            dose={dose}
            type={type}
            canRemove={doses.length > 1}
            onLabelChange={(label) => updateDose(index, { label })}
            onPickTime={() => openPicker(index)}
            onAmountChange={(amount) => updateDose(index, { amount })}
            onRemove={() => removeDose(index)}
          />
        ))}
      </IonList>

      <div style={{ padding: "8px 16px" }}>
        <IonButton fill="clear" onClick={addDose} style={{ minHeight: 44 }}>
          <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
          Add dose
        </IonButton>
      </div>

      <IonModal isOpen={pickingIndex !== null} onDidDismiss={() => setPickingIndex(null)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Dose time</IonTitle>
            <IonButtons slot="end">
              <IonButton strong onClick={closePicker}>
                {pickerDraft === null ? "Skip" : "Done"}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonDatetime
            presentation="time"
            preferWheel
            value={pickerValue ? `${TIME_PICKER_ANCHOR_DATE}T${pickerValue}` : undefined}
            onIonChange={(event) => handleTimeChange(String(event.detail.value ?? ""))}
          />
        </IonContent>
      </IonModal>
    </>
  );
}
