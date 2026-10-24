import type { PluginListenerHandle } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isNative, setupNativeReminders, startNativeReminders } from "./nativeReminders";
import { requestSlotFocus } from "./pendingEdit";

export default function NativeReminderBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) {
      return;
    }

    let stopSync: (() => void) | undefined;
    let handle: PluginListenerHandle | undefined;

    void setupNativeReminders().then(() => {
      stopSync = startNativeReminders();
    });

    void LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
      const slotKey = action.notification.extra?.slotKey;
      if (typeof slotKey === "string") {
        requestSlotFocus(slotKey);
        navigate("/schedule");
      }
    }).then((listener) => {
      handle = listener;
    });

    return () => {
      stopSync?.();
      void handle?.remove();
    };
  }, [navigate]);

  return null;
}
