import { IonButton, IonIcon } from "@ionic/react";
import { createOutline } from "ionicons/icons";
import type { ReactNode } from "react";
import { doseLabel } from "../../../domain/doseLabel";
import { formatDose, hasQuantity } from "../../../domain/doseUnits";
import { describeRepeat } from "../../../domain/repeat";
import type { MedicineDraft } from "../../../domain/medicine";
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
    <section style={{ border: "1px solid", borderRadius: 16, padding: 14 }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{title}</h3>
        <IonButton fill="clear" size="small" onClick={onEdit} style={{ minHeight: 44 }}>
          <IonIcon slot="start" icon={createOutline} aria-hidden="true" />
          Edit
        </IonButton>
      </div>
      <div style={{ marginTop: 4 }}>{children}</div>
    </section>
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
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <SummaryCard title="Medicine" onEdit={() => onEdit("basics")}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{draft.name || "No name"}</div>
        <div style={{ fontSize: 14 }}>{draft.formula || draft.type}</div>
      </SummaryCard>

      <SummaryCard title="How often" onEdit={() => onEdit("repeat")}>
        <div style={{ fontSize: 16 }}>{describeRepeat(draft.repeat)}</div>
        {draft.repeat.kind === "weekly" && (
          <IonButton
            fill="clear"
            size="small"
            onClick={() => onEdit("days")}
            style={{ minHeight: 44, paddingLeft: 0 }}
          >
            Change days
          </IonButton>
        )}
      </SummaryCard>

      <SummaryCard title="Doses" onEdit={() => onEdit("doses")}>
        {draft.doses.map((dose, index) => (
          <div key={`${dose.time}-${index}`} style={{ fontSize: 14, padding: "2px 0" }}>
            {doseLabel(dose, index + 1)} · {dose.time ? formatTime(dose.time) : "No time"}
            {hasQuantity(draft.type) && ` · ${formatDose(dose.amount, draft.type)}`}
          </div>
        ))}
      </SummaryCard>

      <IonButton expand="block" onClick={onSave} style={{ minHeight: 44 }}>
        {isEditing ? "Save changes" : "Save medicine"}
      </IonButton>
      {onDelete && (
        <IonButton
          expand="block"
          color="danger"
          fill="outline"
          onClick={onDelete}
          style={{ minHeight: 44 }}
        >
          Delete medicine
        </IonButton>
      )}
    </div>
  );
}
