/** Platzhalter wie {name} ersetzen (auch im Browser nutzbar) */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}
