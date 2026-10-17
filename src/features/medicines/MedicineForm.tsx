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
  IonAlert,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useRef, useState } from "react";
import { defaultAmount } from "../../domain/doseUnits";
import {
  MEDICINE_TYPES,
  findDuplicateName,
  validateDraft,
  type Dose,
  type Medicine,
  type MedicineDraft,
  type MedicineErrors,
  type MedicineType,
} from "../../domain/medicine";
import { DOSE_PRESETS, resizeDoses } from "../../domain/presets";
import { toClockTime } from "../../domain/time";
import { markRequired } from "../../shared/requiredMark";
import DoseRow from "./DoseRow";

interface MedicineFormProps {
  initial?: Medicine;
  existing: Medicine[];
  onSubmit: (draft: MedicineDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const TIME_PICKER_ANCHOR_DATE = "2000-01-01";

export default function MedicineForm({
  initial,
  existing,
  onSubmit,
  onCancel,
  onDelete,
}: MedicineFormProps) {
  const initialType: MedicineType = initial?.type ?? "Tablet";

  const [name, setName] = useState(initial?.name ?? "");
  const [formula, setFormula] = useState(initial?.formula ?? "");
  const [type, setType] = useState<MedicineType>(initialType);
  const [doses, setDoses] = useState<Dose[]>(initial?.doses ?? resizeDoses([], 1, initialType));
  const [submitted, setSubmitted] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const nameInput = useRef<HTMLIonInputElement>(null);
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const [pickerDraft, setPickerDraft] = useState<string | null>(null);

  const isEditing = initial !== undefined;

  const draft: MedicineDraft = { name, formula, type, doses };
  const errors: MedicineErrors = submitted ? validateDraft(draft) : {};

  const missingLabels: string[] = [];
  if (errors.name) {
    missingLabels.push("Name");
  }
  if (errors.times) {
    missingLabels.push(doses.length === 0 ? "Schedule" : "Dose times");
  }
  const pickerValue =
    pickerDraft ?? (pickingIndex !== null ? doses[pickingIndex]?.time : undefined);

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
    setDoses([...doses, { time: "", amount: defaultAmount(type) }]);
    openPicker(doses.length);
  }

  function openPicker(index: number) {
    setPickerDraft(null);
    setPickingIndex(index);
  }

  function closePicker() {
    if (pickingIndex === null) {
      return;
    }
    if (pickerDraft !== null) {
      setDoses(
        doses.map((dose, position) =>
          position === pickingIndex ? { ...dose, time: pickerDraft } : dose,
        ),
      );
    }
    setPickingIndex(null);
  }

  function handleTimeChange(datetimeValue: string) {
    const clock = toClockTime(datetimeValue);
    if (clock) {
      setPickerDraft(clock);
    }
  }

  function handleSubmit() {
    setSubmitted(true);
    if (Object.keys(validateDraft(draft)).length > 0) {
      return;
    }
    const duplicate = findDuplicateName(draft.name, existing, initial?.id);
    if (duplicate) {
      setDuplicateName(duplicate.name);
      return;
    }
    onSubmit(draft);
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
        {missingLabels.length > 0 && (
          <IonItem color="danger" lines="none">
            <IonLabel className="ion-text-wrap">
              Missing required: {missingLabels.join(", ")}
            </IonLabel>
          </IonItem>
        )}

        <IonList>
          <IonItem>
            <IonInput
              label={markRequired("Name")}
              ref={nameInput}
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
            value={doses.length > 0 ? String(doses.length) : undefined}
            onIonChange={(event) => applyPreset(String(event.detail.value))}
          >
            {DOSE_PRESETS.map((preset, index) => (
              <IonSegmentButton key={preset.label} value={String(index + 1)}>
                <IonLabel>{preset.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        {errors.times && (
          <IonNote
            color="danger"
            className="ion-padding-start"
            style={{ display: "block", paddingTop: 8 }}
          >
            {errors.times}
          </IonNote>
        )}
        {errors.amounts && (
          <IonNote
            color="danger"
            className="ion-padding-start"
            style={{ display: "block", paddingTop: 8 }}
          >
            {errors.amounts}
          </IonNote>
        )}

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

        <div className="ion-padding">
          <IonButton fill="clear" onClick={addDose}>
            <IonIcon slot="start" icon={addOutline} />
            Add dose
          </IonButton>
        </div>

        {onDelete && (
          <div className="ion-padding">
            <IonButton expand="block" color="danger" fill="clear" onClick={onDelete}>
              Delete medicine
            </IonButton>
          </div>
        )}

        <IonAlert
          isOpen={duplicateName !== null}
          header="Name already used"
          message={`A medicine named "${duplicateName ?? ""}" already exists. Rename this one to save it.`}
          buttons={[{ text: "Rename", role: "cancel" }]}
          onDidDismiss={() => {
            setDuplicateName(null);
            nameInput.current?.setFocus();
          }}
        />

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
      </IonContent>
    </>
  );
}
