"use client";

import { useActionState } from "react";
import { login } from "../actions";

type Labels = { password: string; submit: string; submitting: string };

export function LoginForm({ labels, next }: { labels: Labels; next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="field" style={{ gap: 14 }}>
      {next && <input type="hidden" name="next" value={next} />}
      <label htmlFor="password" className="sr-only">{labels.password}</label>
      <input id="password" name="password" type="password" className="input" placeholder={labels.password} autoComplete="current-password" required autoFocus />
      {state?.error && <div className="alert alert-error">{state.error}</div>}
      <button className="btn btn-dark" type="submit" disabled={pending}>{pending ? labels.submitting : labels.submit}</button>
    </form>
  );
}
