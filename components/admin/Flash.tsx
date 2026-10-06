export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <div className="alert alert-error" role="alert">{error}</div>;
  if (ok) return <div className="alert alert-ok" role="status">{ok}</div>;
  return null;
}
