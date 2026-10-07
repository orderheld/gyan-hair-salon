// Inhalt des QR-Codes der Stempelkarte und Lesen eines Kamerabilds.
// Ohne Server-Abhängigkeiten: läuft im Scanner (Browser) und in den Tests (Node).

const PREFIX = "GYAN:";
const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;

/** Text im QR-Code: kurzes Präfix plus geheimer Karten-Token */
export const cardQrPayload = (token: string) => `${PREFIX}${token}`;

/** Token aus einem gescannten Text oder einer Eingabe holen (mit oder ohne Präfix), sonst null */
export function parseCardPayload(text: string): string | null {
  const raw = text.trim();
  const value = raw.toUpperCase().startsWith(PREFIX) ? raw.slice(PREFIX.length) : raw;
  return TOKEN.test(value) ? value : null;
}
