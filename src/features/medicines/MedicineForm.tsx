import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { addOutline, removeCircleOutline } from "ionicons/icons";
import { useState } from "react";
import {
  MEDICINE_TYPES,
  validateDraft,
  type Medicine,
  type MedicineDraft,
  type MedicineErrors,
  type MedicineType,
} from "../../domain/medicine";
import { DOSE_PRESETS } from "../../domain/presets";

interface MedicineFormProps {
  initial?: Medicine;
  onSubmit: (draft: MedicineDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function MedicineForm({ initial, onSubmit, onCancel, onDelete }: MedicineFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [formula, setFormula] = useState(initial?.formula ?? "");
  const [type, setType] = useState<MedicineType>(initial?.type ?? "Tablet");
  const [times, setTimes] = useState<string[]>(initial?.times ?? [...DOSE_PRESETS[0].times]);
  const [errors, setErrors] = useState<MedicineErrors>({});

  const presetValue = String(times.length);
  const isEditing = initial !== undefined;

  function applyPreset(value: string) {
    const preset = DOSE_PRESETS[Number(value) - 1];
    if (preset) {
      setTimes([...preset.times]);
    }
  }

  function updateTime(index: number, value: string) {
    setTimes(times.map((time, position) => (position === index ? value : time)));
  }

  function removeTime(index: number) {
    setTimes(times.filter((_, position) => position !== index));
  }

  function addTime() {
    setTimes([...times, "12:00"]);
  }

  function handleSubmit() {
    const draft: MedicineDraft = { name, formula, type, times };
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
              labelPlacement="stacked"
              placeholder="e.g. Crocin 650"
              value={name}
              onIonInput={(event) => setName(event.detail.value ?? "")}
              errorText={errors.name}
            />
          </IonItem>

          <IonItem>
            <IonInput
              label="Formula (optional)"
              labelPlacement="stacked"
              placeholder="e.g. Paracetamol 650mg"
              value={formula}
              onIonInput={(event) => setFormula(event.detail.value ?? "")}
            />
          </IonItem>

          <IonItem>
            <IonSelect
              label="Type"
              labelPlacement="stacked"
              value={type}
              onIonChange={(event) => setType(event.detail.value as MedicineType)}
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
            value={presetValue}
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
          {times.map((time, index) => (
            <IonItem key={index}>
              <IonInput
                type="time"
                aria-label={`Dose ${index + 1} time`}
                value={time}
                onIonInput={(event) => updateTime(index, event.detail.value ?? "")}
              />
              {times.length > 1 && (
                <IonButton
                  fill="clear"
                  slot="end"
                  aria-label="Remove time"
                  onClick={() => removeTime(index)}
                >
                  <IonIcon icon={removeCircleOutline} />
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>

        <div className="ion-padding">
          <IonButton fill="clear" onClick={addTime}>
            <IonIcon slot="start" icon={addOutline} />
            Add time
          </IonButton>
          {errors.times && <IonNote color="danger">{errors.times}</IonNote>}
        </div>

        {onDelete && (
          <div className="ion-padding">
            <IonButton expand="block" color="danger" fill="clear" onClick={onDelete}>
              Delete medicine
            </IonButton>
          </div>
        )}
      </IonContent>
    </>
  );
}
