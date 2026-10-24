import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Navigate, Route } from "react-router-dom";
import { calendarOutline, medkitOutline } from "ionicons/icons";
import SchedulePage from "./features/today/SchedulePage";
import { useReminders } from "./shared/reminders";
import { playSound } from "./shared/sound";
import NativeReminderBridge from "./shared/NativeReminderBridge";
import MedicinesPage from "./features/medicines/MedicinesPage";

setupIonicReact();

export default function App() {
  useReminders();
  return (
    <IonApp>
      <IonReactRouter>
        <NativeReminderBridge />
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/" element={<Navigate to="/schedule" replace />} />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="schedule" href="/schedule" onClick={() => playSound("tab")}>
              <IonIcon icon={calendarOutline} />
              <IonLabel>Schedule</IonLabel>
            </IonTabButton>
            <IonTabButton tab="medicines" href="/medicines" onClick={() => playSound("tab")}>
              <IonIcon icon={medkitOutline} />
              <IonLabel>Medicines</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
