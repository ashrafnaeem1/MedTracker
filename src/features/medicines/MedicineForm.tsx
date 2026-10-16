import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useState } from "react";
import { defaultAmount } from "../../domain/doseUnits";
import {
  MEDICINE_TYPES,
  validateDraft,
  type Dose,
  type Medicine,
  type MedicineDraft,
  type MedicineErrors,
  type MedicineType,
} from "../../domain/medicine";
import { DOSE_PRESETS, NEW_DOSE_TIME, dosesForPreset, resizeDoses } from "../../domain/presets";
import { toClockTime } from "../../domain/time";
import DoseRow from "./DoseRow";

interface MedicineFormProps {
  initial?: Medicine;
  onSubmit: (draft: MedicineDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const PICKER_DATE = "2000-01-01";

export default function MedicineForm({ initial, onSubmit, onCancel, onDelete }: MedicineFormProps) {
  const initialType: MedicineType = initial?.type ?? "Tablet";

  const [name, setName] = useState(initial?.name ?? "");
  const [formula, setFormula] = useState(initial?.formula ?? "");
  const [type, setType] = useState<MedicineType>(initialType);
  const [doses, setDoses] = useState<Dose[]>(initial?.doses ?? dosesForPreset(1, initialType));
  const [errors, setErrors] = useState<MedicineErrors>({});
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);

  const isEditing = initial !== undefined;
  const pickedTime = pickingIndex !== null ? doses[pickingIndex]?.time : undefined;

  function changeType(next: MedicineType) {
    setType(next);
    setDoses(doses.map((dose) => ({ ...dose, amount: defaultAmount(next) })));
  }

  function applyPreset(value: string) {
    setDoses(resizeDoses(doses, Number(value), type));
  }

  function updateDose(index: number, changes: Partial<Dose>) {
    setDoses(doses.map((dose, position) => (position === index ? { ...dose, ...changes } : dose)));
  }

  function removeDose(index: number) {
    setDoses(doses.filter((_, position) => position !== index));
  }

  function addDose() {
    setDoses([...doses, { time: NEW_DOSE_TIME, amount: defaultAmount(type) }]);
  }

  function handleTimeChange(datetimeValue: string) {
    const clock = toClockTime(datetimeValue);
    if (pickingIndex !== null && clock) {
      updateDose(pickingIndex, { time: clock });
    }
  }

  function handleSubmit() {
    const draft: MedicineDraft = { name, formula, type, doses };
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit(draft);
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCancel}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>{isEditing ? "Edit medicine" : "New medicine"}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={handleSubmit}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonInput
              label="Name"
              name="medicine-name"
              labelPlacement="stacked"
              placeholder="e.g. Crocin 650"
              value={name}
              onIonInput={(event) => setName(event.detail.value ?? "")}
            />
          </IonItem>
          {errors.name && (
            <IonNote color="danger" className="ion-padding-start">
              {errors.name}
            </IonNote>
          )}

          <IonItem>
            <IonInput
              label="Formula (optional)"
              name="medicine-formula"
              labelPlacement="stacked"
              placeholder="e.g. Paracetamol 650mg"
              value={formula}
              onIonInput={(event) => setFormula(event.detail.value ?? "")}
            />
          </IonItem>

          <IonItem>
            <IonSelect
              label="Type"
              name="medicine-type"
              labelPlacement="stacked"
              value={type}
              onIonChange={(event) => changeType(event.detail.value as MedicineType)}
            >
              {MEDICINE_TYPES.map((option) => (
                <IonSelectOption key={option} value={option}>
                  {option}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>

        <div className="ion-padding">
          <IonSegment
            value={String(doses.length)}
            onIonChange={(event) => applyPreset(String(event.detail.value))}
          >
            {DOSE_PRESETS.map((preset, index) => (
              <IonSegmentButton key={preset.label} value={String(index + 1)}>
                <IonLabel>{preset.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
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
              onPickTime={() => setPickingIndex(index)}
              onAmountChange={(amount) => updateDose(index, { amount })}
              onRemove={() => removeDose(index)}
            />
          ))}
        </IonList>

        <div className="ion-padding">
          <IonButton fill="clear" onClick={addDose}>
            <IonIcon slot="start" icon={addOutline} />
            Add dose
          </IonButton>
          {errors.times && <IonNote color="danger">{errors.times}</IonNote>}
          {errors.amounts && <IonNote color="danger">{errors.amounts}</IonNote>}
        </div>

        {onDelete && (
          <div className="ion-padding">
            <IonButton expand="block" color="danger" fill="clear" onClick={onDelete}>
              Delete medicine
            </IonButton>
          </div>
        )}

        <IonModal isOpen={pickingIndex !== null} onDidDismiss={() => setPickingIndex(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Dose time</IonTitle>
              <IonButtons slot="end">
                <IonButton strong onClick={() => setPickingIndex(null)}>
                  Done
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonDatetime
              presentation="time"
              preferWheel
              value={pickedTime ? `${PICKER_DATE}T${pickedTime}` : undefined}
              onIonChange={(event) => handleTimeChange(String(event.detail.value ?? ""))}
            />
          </IonContent>
        </IonModal>
      </IonContent>
    </>
  );
}
