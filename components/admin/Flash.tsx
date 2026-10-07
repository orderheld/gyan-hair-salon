"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/Toast";

/**
 * Meldung nach dem Speichern (?ok= / ?error= nach einer Server-Aktion): schwebend oben, gut sichtbar,
 * auch wenn man weit unten gespeichert hat. Danach verschwindet der Text aus der Adresse,
 * damit Neuladen oder Zurück die Meldung nicht nochmals zeigt.
 */
export function Flash({ ok, error }: { ok?: string; error?: string }) {
  useEffect(() => {
    if (error) toast(error, "error");
    else if (ok) toast(ok, "ok");
    if (ok || error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("ok");
      url.searchParams.delete("error");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
  }, [ok, error]);
  return null;
}
