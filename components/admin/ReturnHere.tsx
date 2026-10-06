"use client";

import { usePathname } from "next/navigation";

/** Damit ein Formular im Kopf (z. B. Sprache) auf der aktuellen Admin-Seite bleibt. */
export function ReturnHere() {
  return <input type="hidden" name="returnTo" value={usePathname() || "/admin"} />;
}
