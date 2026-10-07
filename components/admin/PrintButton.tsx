"use client";

export function PrintButton({ label }: { label: string }) {
  return <button type="button" className="btn btn-light" onClick={() => window.print()}>{label}</button>;
}
