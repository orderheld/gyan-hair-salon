import { isAdmin } from "@/lib/auth";
import { buildEmail, sampleBooking } from "@/lib/email";
import { isLocale } from "@/lib/i18n/config";
import { EMAIL_TYPES, type EmailType } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Vorschau einer E-Mail mit Beispieldaten (nur für eingeloggte Admins)
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "confirmation";
  const locale = url.searchParams.get("locale") ?? "de";
  if (!(EMAIL_TYPES as readonly string[]).includes(type) || !isLocale(locale)) return new Response("Bad request", { status: 400 });
  const mail = await buildEmail(type as EmailType, sampleBooking(locale), { locale, preview: true });
  return new Response(mail.html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
