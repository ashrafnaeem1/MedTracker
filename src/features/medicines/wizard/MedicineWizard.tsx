import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { defaultAmount } from "../../../domain/doseUnits";
import {
  findDuplicateName,
  validateDraft,
  type Medicine,
  type MedicineDraft,
  type MedicineErrors,
  type MedicineType,
  type Repeat,
  type Weekday,
} from "../../../domain/medicine";
import { resizeDoses } from "../../../domain/presets";
import { playSound } from "../../../shared/sound";
import BasicsStep from "./BasicsStep";
import DaysStep from "./DaysStep";
import DosesStep from "./DosesStep";
import RepeatStep from "./RepeatStep";
import ReviewStep from "./ReviewStep";

export type StepId = "basics" | "repeat" | "days" | "doses" | "review";

const STEP_TITLES: Record<StepId, string> = {
  basics: "Name and type",
  repeat: "How often",
  days: "Which days",
  doses: "Doses",
  review: "Review",
};

const STEP_FIELDS: Record<StepId, (keyof MedicineErrors)[]> = {
  basics: ["name"],
  repeat: [],
  days: ["days"],
  doses: ["times", "amounts"],
  review: [],
};

interface MedicineWizardProps {
  initial?: Medicine;
  existing: Medicine[];
  onSubmit: (draft: MedicineDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function startDraft(initial?: Medicine): MedicineDraft {
  if (initial) {
    return {
      name: initial.name,
      formula: initial.formula,
      type: initial.type,
      repeat: initial.repeat,
      doses: initial.doses,
    };
  }
  return {
    name: "",
    formula: "",
    type: "Tablet",
    repeat: { kind: "daily" },
    doses: resizeDoses([], 1, "Tablet"),
  };
}

export default function MedicineWizard({
  initial,
  existing,
  onSubmit,
  onCancel,
  onDelete,
}: MedicineWizardProps) {
  const isEditing = initial !== undefined;
  const [draft, setDraft] = useState<MedicineDraft>(() => startDraft(initial));
  const [step, setStep] = useState<StepId>(isEditing ? "review" : "basics");
  const [showErrors, setShowErrors] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);

  const steps: StepId[] =
    draft.repeat.kind === "weekly"
      ? ["basics", "repeat", "days", "doses", "review"]
      : ["basics", "repeat", "doses", "review"];
  const errors = validateDraft(draft);
  const visibleErrors: MedicineErrors = showErrors ? errors : {};
  const stepHasError = (id: StepId) => STEP_FIELDS[id].some((key) => errors[key] !== undefined);

  const index = steps.indexOf(step);

  function patch(changes: Partial<MedicineDraft>) {
    setDraft((previous) => ({ ...previous, ...changes }));
  }

  function changeType(next: MedicineType) {
    setDraft((previous) => ({
      ...previous,
      type: next,
      doses: previous.doses.map((dose) => ({ ...dose, amount: defaultAmount(next) })),
    }));
  }

  function changeRepeat(next: Repeat) {
    patch({ repeat: next });
  }

  function goTo(id: StepId) {
    playSound("step");
    setShowErrors(false);
    setStep(id);
  }

  function next() {
    setShowErrors(true);
    if (stepHasError(step)) {
      return;
    }
    goTo(steps[Math.min(index + 1, steps.length - 1)]);
  }

  function back() {
    if (index > 0) {
      goTo(steps[index - 1]);
    }
  }

  function save() {
    setShowErrors(true);
    const firstInvalid = steps.find((id) => id !== "review" && stepHasError(id));
    if (firstInvalid) {
      setStep(firstInvalid);
      return;
    }
    const duplicate = findDuplicateName(draft.name, existing, initial?.id);
    if (duplicate) {
      setDuplicateName(duplicate.name);
      return;
    }
    onSubmit(draft);
  }

  const progress = step === "review" ? null : `Step ${index + 1} of ${steps.length - 1}`;

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCancel}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>{isEditing ? "Edit medicine" : "New medicine"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {progress && (
          <p style={{ margin: "12px 16px 0", fontSize: 14, fontWeight: 600, color: "#374151" }}>
            {progress} · {STEP_TITLES[step]}
          </p>
        )}

        {step === "basics" && (
          <BasicsStep
            draft={draft}
            errors={visibleErrors}
            onChange={patch}
            onTypeChange={changeType}
          />
        )}
        {step === "repeat" && <RepeatStep repeat={draft.repeat} onChange={changeRepeat} />}
        {step === "days" && draft.repeat.kind === "weekly" && (
          <DaysStep
            days={draft.repeat.days}
            error={visibleErrors.days}
            onChange={(days: Weekday[]) => changeRepeat({ kind: "weekly", days })}
          />
        )}
        {step === "doses" && (
          <DosesStep
            type={draft.type}
            doses={draft.doses}
            errors={visibleErrors}
            onChange={(doses) => patch({ doses })}
          />
        )}
        {step === "review" && (
          <ReviewStep
            draft={draft}
            isEditing={isEditing}
            onEdit={goTo}
            onSave={save}
            onDelete={onDelete}
          />
        )}

        <IonAlert
          isOpen={duplicateName !== null}
          header="Name already used"
          message={`A medicine named "${duplicateName ?? ""}" already exists. Rename this one to save it.`}
          buttons={[{ text: "Rename", handler: () => goTo("basics") }]}
          onDidDismiss={() => setDuplicateName(null)}
        />
      </IonContent>

      {step !== "review" && (
        <IonFooter>
          <IonToolbar style={{ padding: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <IonButton
                fill="outline"
                style={{ flex: 1, minHeight: 44 }}
                disabled={index === 0}
                onClick={back}
              >
                Back
              </IonButton>
              <IonButton style={{ flex: 1, minHeight: 44 }} onClick={next}>
                Next
              </IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      )}
    </>
  );
}
