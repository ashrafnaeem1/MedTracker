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

// Icons for calendar and medkit. Both outline.
import { calendarOutline, medkitOutline } from "ionicons/icons";

// Pages
import TodayPage from "./features/today/TodayPage";
import MedicinePage from "./features/medicines/MedicinePage";

setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/today" element={<TodayPage />} />
            <Route path="/medicines" element={<MedicinePage />} />
            <Route path="/" element={<Navigate to="/today" replace />} />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="today" href="/today">
              <IonIcon icon={calendarOutline} />
              <IonLabel>Today</IonLabel>
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
};

export default App;
