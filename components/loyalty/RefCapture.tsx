"use client";

import { useEffect } from "react";

/** Einladungscode aus dem Link 30 Tage merken, falls die Anmeldung erst später passiert */
export function RefCapture({ code }: { code: string }) {
  useEffect(() => {
    if (/^[A-Z0-9]{4,12}$/.test(code)) document.cookie = `gyan_ref=${code}; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  }, [code]);
  return null;
}
