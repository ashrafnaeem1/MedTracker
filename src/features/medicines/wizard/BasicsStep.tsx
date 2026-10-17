import { IonInput, IonItem, IonList, IonNote, IonSelect, IonSelectOption } from "@ionic/react";
import {
  MEDICINE_TYPES,
  type MedicineDraft,
  type MedicineErrors,
  type MedicineType,
} from "../../../domain/medicine";
import { markRequired } from "../../../shared/requiredMark";

interface BasicsStepProps {
  draft: MedicineDraft;
  errors: MedicineErrors;
  onChange: (changes: Partial<MedicineDraft>) => void;
  onTypeChange: (type: MedicineType) => void;
}

export default function BasicsStep({ draft, errors, onChange, onTypeChange }: BasicsStepProps) {
  return (
    <IonList>
      <IonItem>
        <IonInput
          label={markRequired("Name")}
          labelPlacement="stacked"
          placeholder="e.g. Crocin 650"
          name="medicine-name"
          value={draft.name}
          onIonInput={(event) => onChange({ name: event.detail.value ?? "" })}
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
          labelPlacement="stacked"
          placeholder="e.g. Paracetamol 650mg"
          name="medicine-formula"
          value={draft.formula}
          onIonInput={(event) => onChange({ formula: event.detail.value ?? "" })}
        />
      </IonItem>

      <IonItem>
        <IonSelect
          label="Type"
          labelPlacement="stacked"
          name="medicine-type"
          value={draft.type}
          onIonChange={(event) => onTypeChange(event.detail.value as MedicineType)}
        >
          {MEDICINE_TYPES.map((option) => (
            <IonSelectOption key={option} value={option}>
              {option}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
    </IonList>
  );
}
