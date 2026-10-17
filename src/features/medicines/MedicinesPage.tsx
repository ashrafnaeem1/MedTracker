import {
  IonAlert,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useState } from "react";
import { doseLabel } from "../../domain/doseLabel";
import { formatDose, hasQuantity } from "../../domain/doseUnits";
import {
  createMedicine,
  updateMedicine,
  type Medicine,
  type MedicineDraft,
} from "../../domain/medicine";
import { formatTime } from "../../domain/time";
import { takePendingEdit } from "../../shared/pendingEdit";
import { medicineRepository } from "../../storage/medicineRepository";
import MedicineForm from "./MedicineForm";
import { useMedicines } from "./useMedicines";

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
          <p className="ion-padding">No medicines yet. Tap + to add one.</p>
        ) : (
          <IonList>
            {items.map((medicine) => (
              <IonItem key={medicine.id} button detail onClick={() => openEdit(medicine)}>
                <IonLabel>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                    {medicine.name}
                  </h2>
                  <p>{medicine.formula || medicine.type}</p>
                  {medicine.doses.map((dose, index) => (
                    <p key={dose.time}>
                      {doseLabel(dose, index + 1)} · {formatTime(dose.time)}
                      {hasQuantity(medicine.type) && `: ${formatDose(dose.amount, medicine.type)}`}
                    </p>
                  ))}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={openAdd} aria-label="Add medicine">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={isFormOpen} onDidDismiss={closeForm}>
          <MedicineForm
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
