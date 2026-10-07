// GYAN Service Worker: nur eine Offline-Seite, sonst immer frisch aus dem Netz.
const CACHE = "gyan-offline-v1";
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, "/icons/favicon.svg"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});

// Push-Benachrichtigungen: Termin bestätigt, Erinnerung, Dankeschön, neue Buchung fürs Admin
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "GYAN Hair Salon", body: event.data ? event.data.text() : "" };
  }
  const admin = String(data.url || "").startsWith("/admin");
  const options = {
    body: data.body || "",
    icon: admin ? "/icons/admin-192.png" : "/icons/app-192.png",
    badge: "/icons/badge-96.png",
    tag: data.tag,
    renotify: !!data.tag,
    data: { url: data.url || "/", actions: data.actions || [] },
    actions: (data.actions || []).slice(0, 2).map((a) => ({ action: a.action, title: a.title })),
  };
  event.waitUntil(self.registration.showNotification(data.title || "GYAN Hair Salon", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  const hit = (d.actions || []).find((a) => a.action === event.action);
  const url = new URL(hit ? hit.url : d.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const same = list.find((c) => c.url === url);
      if (same) return same.focus();
      return self.clients.openWindow(url);
    }),
  );
});
