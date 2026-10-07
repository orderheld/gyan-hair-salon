"use client";

import { useFormStatus } from "react-dom";

/**
 * Knopf für eine Server-Aktion innerhalb eines gemeinsamen Formulars (formAction), optional mit Rückfrage.
 * Während eine Aktion läuft, sind alle Knöpfe des Formulars gesperrt: kein Doppeltippen.
 */
export function ActionButton({ action, children, className = "btn btn-dark", confirm }: { action: (fd: FormData) => Promise<void>; children: React.ReactNode; className?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={action}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
