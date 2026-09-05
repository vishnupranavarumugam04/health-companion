const TELEMETRY_DB = "HealthCompanionDB";
const TELEMETRY_STORE = "telemetry_buffer";
const SYNC_TAG = "health-companion-telemetry";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CHECK_CONNECTION" && event.source) {
    event.source.postMessage({ type: "BACKGROUND_CONNECTION_READY" });
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(self.clients.matchAll({ type: "window" }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "BACKGROUND_CONNECTION_READY" }));
    }));
  }
});

void TELEMETRY_DB;
void TELEMETRY_STORE;

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
