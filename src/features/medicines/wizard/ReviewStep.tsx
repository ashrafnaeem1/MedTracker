import type { ReactNode } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonNote,
} from "@ionic/react";
import { createOutline } from "ionicons/icons";
import { doseLabel } from "../../../domain/doseLabel";
import { formatDose, hasQuantity } from "../../../domain/doseUnits";
import type { MedicineDraft } from "../../../domain/medicine";
import { describeRepeat } from "../../../domain/repeat";
import { formatTime } from "../../../domain/time";
import type { StepId } from "./MedicineWizard";

interface ReviewStepProps {
  draft: MedicineDraft;
  isEditing: boolean;
  onEdit: (step: StepId) => void;
  onSave: () => void;
  onDelete?: () => void;
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>{title}</IonCardSubtitle>
        <IonButton
          fill="clear"
          size="small"
          onClick={onEdit}
          style={{ position: "absolute", top: 8, right: 8 }}
        >
          <IonIcon slot="start" icon={createOutline} aria-hidden="true" />
          Edit
        </IonButton>
      </IonCardHeader>
      <IonCardContent>{children}</IonCardContent>
    </IonCard>
  );
}

export default function ReviewStep({
  draft,
  isEditing,
  onEdit,
  onSave,
  onDelete,
}: ReviewStepProps) {
  return (
    <div className="mt-section">
      <SummaryCard title="Medicine" onEdit={() => onEdit("basics")}>
        <IonCardTitle>{draft.name || "No name"}</IonCardTitle>
        <IonNote>{draft.formula || draft.type}</IonNote>
      </SummaryCard>

      <SummaryCard title="How often" onEdit={() => onEdit("repeat")}>
        <IonCardTitle>{describeRepeat(draft.repeat)}</IonCardTitle>
        {draft.repeat.kind === "weekly" && (
          <IonButton fill="clear" size="small" onClick={() => onEdit("days")}>
            Change days
          </IonButton>
        )}
      </SummaryCard>

      <SummaryCard title="Doses" onEdit={() => onEdit("doses")}>
        {draft.doses.map((dose, index) => (
          <IonNote key={`${dose.time}-${index}`} style={{ display: "block" }}>
            {doseLabel(dose, index + 1)} · {dose.time ? formatTime(dose.time) : "No time"}
            {hasQuantity(draft.type) && ` · ${formatDose(dose.amount, draft.type)}`}
          </IonNote>
        ))}
      </SummaryCard>

      <IonButton expand="block" onClick={onSave}>
        {isEditing ? "Save changes" : "Save medicine"}
      </IonButton>
      {onDelete && (
        <IonButton expand="block" color="danger" fill="outline" onClick={onDelete}>
          Delete medicine
        </IonButton>
      )}
    </div>
  );
}
