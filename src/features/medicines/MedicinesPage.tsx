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
  IonNote,
  IonText,
  IonListHeader,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { addOutline, medkitOutline } from "ionicons/icons";
import { useState } from "react";
import { doseLabel } from "../../domain/doseLabel";
import { formatDose, hasQuantity } from "../../domain/doseUnits";
import { describeRepeat } from "../../domain/repeat";
import {
  createMedicine,
  updateMedicine,
  type Medicine,
  type MedicineDraft,
} from "../../domain/medicine";
import { formatTime } from "../../domain/time";
import { appActions } from "../../shared/actions";
import { takePendingAdd, takePendingEdit } from "../../shared/pendingEdit";
import { playSound } from "../../shared/sound";
import { medicineRepository } from "../../storage/medicineRepository";
import MedicineWizard from "./wizard/MedicineWizard";
import { useMedicines } from "./useMedicines";

function DoseLines({ medicine }: { medicine: Medicine }) {
  return (
    <>
      {medicine.doses.map((dose, index) => (
        <IonNote key={dose.time} style={{ display: "block" }}>
          {doseLabel(dose, index + 1)} · {formatTime(dose.time)}
          {hasQuantity(medicine.type) && ` · ${formatDose(dose.amount, medicine.type)}`}
        </IonNote>
      ))}
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
    playSound("save");
    appActions.saveMedicine(editing ? updateMedicine(editing, draft) : createMedicine(draft));
    refresh();
    closeForm();
  }

  function confirmDelete() {
    if (editing) {
      appActions.removeMedicine(editing.id);
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
          <div className="mt-empty">
            <IonIcon icon={medkitOutline} aria-hidden="true" style={{ fontSize: 56 }} />
            <h2 className="mt-name" style={{ margin: "16px 0 8px" }}>
              No medicines yet
            </h2>
            <IonText color="medium">
              <p>Add a medicine and its doses to see them on the Schedule tab.</p>
            </IonText>
            <IonButton style={{ marginTop: 24 }} onClick={openAdd}>
              <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
              Add medicine
            </IonButton>
          </div>
        ) : (
          <>
            <IonListHeader>
              <IonLabel>
                {items.length} {items.length === 1 ? "medicine" : "medicines"}
              </IonLabel>
            </IonListHeader>
            <IonList lines="none">
              {items.map((medicine) => (
                <IonItem
                  key={medicine.id}
                  button
                  detail
                  onClick={() => openEdit(medicine)}
                  className="mt-row"
                >
                  <IonLabel className="ion-text-wrap">
                    <h2 className="mt-name">{medicine.name}</h2>
                    <IonNote>{medicine.formula || medicine.type}</IonNote>
                    <IonNote>{describeRepeat(medicine.repeat)}</IonNote>
                    <DoseLines medicine={medicine} />
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
