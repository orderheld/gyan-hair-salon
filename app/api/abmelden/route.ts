import { site } from "@/content/site";
import { checkUnsubscribeToken, optOut } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

/**
 * Abmeldung von freiwilligen E-Mails (Dank nach dem Besuch, Geburtstagsgruss).
 * GET zeigt eine Seite mit Knopf (damit Virenscanner, die Links vorab öffnen, niemanden abmelden),
 * POST meldet ab: so ruft Gmail/Apple die Ein-Klick-Abmeldung auf (RFC 8058, List-Unsubscribe-Post).
 */
const TEXT = {
  ask: ["Keine freiwilligen E-Mails mehr?", "Plus d'e-mails facultatifs ?", "No more optional emails?"],
  askBody: [
    "Du bekommst dann keinen Dank nach dem Besuch und keinen Geburtstagsgruss mehr. Bestätigungen und Erinnerungen zu deinen Terminen kommen weiterhin.",
    "Tu ne recevras plus de remerciement après ta visite ni de vœux d'anniversaire. Les confirmations et rappels de rendez-vous continuent.",
    "You will no longer get the thank-you after your visit or the birthday greeting. Appointment confirmations and reminders still arrive.",
  ],
  button: ["Abmelden", "Me désinscrire", "Unsubscribe"],
  done: ["Du bist abgemeldet.", "Tu es désinscrit.", "You are unsubscribed."],
  doneBody: [
    "Termin-Bestätigungen und Erinnerungen bekommst du weiterhin.",
    "Tu recevras toujours les confirmations et rappels de rendez-vous.",
    "You will still receive appointment confirmations and reminders.",
  ],
  bad: ["Dieser Link ist ungültig.", "Ce lien n'est pas valable.", "This link is not valid."],
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const all = (k: keyof typeof TEXT, tag = "p") => TEXT[k].map((t, i) => `<${tag} lang="${["de", "fr", "en"][i]}">${esc(t)}</${tag}>`).join("");

function page(inner: string, status = 200) {
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(site.name)}</title>
<style>body{margin:0;background:#f3ece1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141210}main{max-width:460px;margin:48px auto;background:#fffdf9;border-radius:22px;padding:32px 28px;text-align:center}h1{font-size:20px;margin:0 0 6px}p{color:#4a443d;font-size:14px;line-height:1.6;margin:0 0 12px}h1+h1{color:#8a8176;font-size:16px;font-weight:500}button{margin-top:12px;padding:13px 28px;border:0;border-radius:999px;background:#141210;color:#fbf8f3;font-size:15px;font-weight:600;cursor:pointer}a{color:#6b5b4b}</style></head>
<body><main><p style="letter-spacing:.3em;font-size:11px;text-transform:uppercase;color:#8a8176">${esc(site.name)}</p>${inner}<p style="margin-top:22px"><a href="${site.url}">${esc(site.url.replace(/^https?:\/\//, ""))}</a></p></main></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function params(url: string) {
  const u = new URL(url);
  return { email: (u.searchParams.get("e") ?? "").trim().toLowerCase(), token: u.searchParams.get("t") ?? "" };
}

export async function GET(request: Request) {
  const { email, token } = params(request.url);
  if (!email || !checkUnsubscribeToken(email, token)) return page(all("bad", "h1"), 400);
  return page(
    `${all("ask", "h1")}<p style="margin-top:14px"><strong>${esc(email)}</strong></p>${all("askBody")}
<form method="post"><button type="submit">${TEXT.button.map(esc).join(" · ")}</button></form>`,
  );
}

export async function POST(request: Request) {
  const { email, token } = params(request.url);
  if (!email || !checkUnsubscribeToken(email, token)) return page(all("bad", "h1"), 400);
  await optOut(email);
  return page(`${all("done", "h1")}${all("doneBody")}`);
}
