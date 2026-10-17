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
import TodayPage from "./features/today/SchedulePage";
import MedicinesPage from "./features/medicines/MedicinesPage";

setupIonicReact();

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/schedule" element={<TodayPage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/" element={<Navigate to="/schedule" replace />} />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="schedule" href="/schedule">
              <IonIcon icon={calendarOutline} />
              <IonLabel>Schedule</IonLabel>
            </IonTabButton>
            <IonTabButton tab="medicines" href="/medicines">
              <IonIcon icon={medkitOutline} />
              <IonLabel>Medicines</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
