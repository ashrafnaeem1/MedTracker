/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const slotKey =
    typeof event.notification.data?.slotKey === "string" ? event.notification.data.slotKey : null;
  const target = slotKey ? `/schedule?slot=${encodeURIComponent(slotKey)}` : "/schedule";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows[0];
      if (existing) {
        await existing.focus();
        if (slotKey) {
          existing.postMessage({ type: "open-slot", slotKey });
        }
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
