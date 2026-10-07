"use client";

import { useFormStatus } from "react-dom";

export function ConfirmButton({ children, message, className = "btn btn-light btn-sm", name, value, disabled = false, ariaLabel }: { children: React.ReactNode; message: string; className?: string; name?: string; value?: string; disabled?: boolean; ariaLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      name={name}
      value={value}
      aria-label={ariaLabel}
      disabled={pending || disabled}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}

export function SubmitButton({ children, className = "btn btn-dark btn-sm", pendingLabel = "…", disabled = false }: { children: React.ReactNode; className?: string; pendingLabel?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </button>
  );
}
