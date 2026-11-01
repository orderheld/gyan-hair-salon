"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Holt beim Öffnen des Formulars ein Spamschutz-Token (GET /api/form).
 * token() liefert es fürs Absenden, renew() holt ein neues (nach Fehler «formRetry»).
 */
export function useFormGuard() {
  const ref = useRef<Promise<string> | null>(null);
  const renew = useCallback(() => {
    ref.current = fetch("/api/form", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { t?: string }) => String(d.t ?? ""))
      .catch(() => "");
    return ref.current;
  }, []);
  useEffect(() => {
    if (!ref.current) renew();
  }, [renew]);
  const token = useCallback(async () => (await (ref.current ?? renew())) || (await renew()), [renew]);
  return { token, renew };
}
