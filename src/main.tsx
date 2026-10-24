import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/palettes/dark.system.css";
import "@ionic/react/css/palettes/dark.class.css";
import "./theme/tokens.css";
import "./theme/app.css";
import "./theme/ui.css";
import App from "./App";
import { applyTheme } from "./shared/theme";

applyTheme("system");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
