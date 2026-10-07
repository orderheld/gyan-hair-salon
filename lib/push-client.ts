"use client";

/** Browser-Seite der Push-Benachrichtigungen */
export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export function pushPermission(): NotificationPermission | "unsupported" {
  return pushSupported() ? Notification.permission : "unsupported";
}

/** Muss direkt in einem Klick aufgerufen werden (sonst blockieren Safari und Firefox die Abfrage) */
export function askPushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!pushSupported()) return Promise.resolve("unsupported");
  if (Notification.permission !== "default") return Promise.resolve(Notification.permission);
  try {
    return Notification.requestPermission();
  } catch {
    return Promise.resolve("default");
  }
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Gerät anmelden, wenn die Erlaubnis schon da ist. Gibt true zurück, wenn es geklappt hat. */
export async function subscribePush(extra: { role: "admin" } | { role: "customer"; bookingId: string; locale: string }): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  try {
    const cfg = await fetch("/api/push", { cache: "no-store" }).then((r) => r.json());
    if (!cfg.enabled || !cfg.publicKey) return false;
    const reg = (await navigator.serviceWorker.getRegistration("/")) ?? (await navigator.serviceWorker.register("/sw.js"));
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(cfg.publicKey) });
    const res = await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), ...extra }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
