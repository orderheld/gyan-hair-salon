"use client";

import { useSearchParams } from "next/navigation";
import { Fragment, useRef } from "react";

/**
 * Nach erfolgreichem Speichern (?ok=) wird der Seiteninhalt frisch aufgebaut: Formulare zeigen den gespeicherten Stand,
 * Eingabefelder für Neues sind wieder leer. Bei einem Fehler bleibt alles Eingetippte stehen.
 */
export function FreshOnSave({ children }: { children: React.ReactNode }) {
  const ok = useSearchParams().get("ok");
  const n = useRef(0);
  const last = useRef<string | null>(null);
  if (ok && ok !== last.current) n.current += 1;
  last.current = ok;
  return <Fragment key={n.current}>{children}</Fragment>;
}
