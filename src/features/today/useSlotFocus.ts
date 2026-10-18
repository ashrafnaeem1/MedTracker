import { useEffect } from "react";

export function useSlotFocus(onRequest: (slotKey: string) => void): void {
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("slot");
    if (fromUrl) {
      onRequest(fromUrl);
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "open-slot" && typeof event.data.slotKey === "string") {
        onRequest(event.data.slotKey);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [onRequest]);
}
