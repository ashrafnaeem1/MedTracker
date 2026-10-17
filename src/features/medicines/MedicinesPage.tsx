import {
  IonAlert,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { addOutline, medkitOutline } from "ionicons/icons";
import { useState, type CSSProperties } from "react";
import { doseLabel } from "../../domain/doseLabel";
import { formatDose, hasQuantity } from "../../domain/doseUnits";
import {
  createMedicine,
  updateMedicine,
  type Medicine,
  type MedicineDraft,
} from "../../domain/medicine";
import { describeRepeat } from "../../domain/repeat";
import { formatTime } from "../../domain/time";
import { takePendingAdd, takePendingEdit } from "../../shared/pendingEdit";
import { medicineRepository } from "../../storage/medicineRepository";
import MedicineWizard from "./wizard/MedicineWizard";
import { useMedicines } from "./useMedicines";

const ROW_STYLE: CSSProperties = {
  marginBottom: 10,
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "#ffffff",
  "--padding-top": "12px",
  "--padding-bottom": "12px",
  "--inner-border-width": "0",
} as CSSProperties;

function DoseLines({ medicine }: { medicine: Medicine }) {
  return (
    <>
      {medicine.doses.map((dose, index) => {
        return (
          <p
            key={dose.time}
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#4b5563",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span>
              {doseLabel(dose, index + 1)} · {formatTime(dose.time)}
            </span>
            {hasQuantity(medicine.type) && <span>{formatDose(dose.amount, medicine.type)}</span>}
          </p>
        );
      })}
    </>
  );
}

export default function MedicinesPage() {
  const { items, refresh } = useMedicines();
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function openAdd() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function openEdit(medicine: Medicine) {
    setEditing(medicine);
    setIsFormOpen(true);
  }

  useIonViewWillEnter(() => {
    if (takePendingAdd()) {
      openAdd();
      return;
    }
    const requestedId = takePendingEdit();
    if (requestedId === null) {
      return;
    }
    const medicine = medicineRepository.list().find((item) => item.id === requestedId);
    if (medicine) {
      openEdit(medicine);
    }
  });

  function closeForm() {
    setIsFormOpen(false);
  }

  function save(draft: MedicineDraft) {
    medicineRepository.save(editing ? updateMedicine(editing, draft) : createMedicine(draft));
    refresh();
    closeForm();
  }

  function confirmDelete() {
    if (editing) {
      medicineRepository.remove(editing.id);
      refresh();
    }
    closeForm();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Medicines</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <IonIcon
              icon={medkitOutline}
              aria-hidden="true"
              style={{ fontSize: 56, color: "#4b5563" }}
            />
            <h2 style={{ margin: "16px 0 8px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
              No medicines yet
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: "#374151" }}>
              Add a medicine and its doses to see them on the Schedule tab.
            </p>
            <IonButton style={{ marginTop: 24, minHeight: 44 }} onClick={openAdd}>
              <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
              Add medicine
            </IonButton>
          </div>
        ) : (
          <>
            <IonListHeader>
              <IonLabel style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                {items.length} {items.length === 1 ? "medicine" : "medicines"}
              </IonLabel>
            </IonListHeader>
            <IonList lines="none" style={{ padding: "0 12px" }}>
              {items.map((medicine) => (
                <IonItem
                  key={medicine.id}
                  button
                  detail
                  onClick={() => openEdit(medicine)}
                  style={ROW_STYLE}
                >
                  <IonLabel className="ion-text-wrap">
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
                      {medicine.name}
                    </h2>
                    <p style={{ margin: "2px 0 0", fontSize: 14, color: "#374151" }}>
                      {medicine.formula || medicine.type}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#4b5563" }}>
                      {describeRepeat(medicine.repeat)}
                    </p>
                    <div style={{ marginTop: 6 }}>
                      <DoseLines medicine={medicine} />
                    </div>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </>
        )}

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={openAdd} aria-label="Add medicine">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={isFormOpen} onDidDismiss={closeForm}>
          <MedicineWizard
            key={editing?.id ?? "new"}
            initial={editing ?? undefined}
            existing={items}
            onSubmit={save}
            onCancel={closeForm}
            onDelete={editing ? () => setIsConfirmOpen(true) : undefined}
          />
        </IonModal>

        <IonAlert
          isOpen={isConfirmOpen}
          onDidDismiss={() => setIsConfirmOpen(false)}
          header="Delete medicine?"
          message="Its dose history will be kept."
          buttons={[
            { text: "Cancel", role: "cancel" },
            { text: "Delete", role: "destructive", handler: confirmDelete },
          ]}
        />
      </IonContent>
    </IonPage>
  );
}
