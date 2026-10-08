import { posts } from "@/content/blog";
import { site } from "@/content/site";
import services from "@/db/services.json";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { postPath, servicePath } from "@/lib/i18n/paths";

// Kurzüberblick für KI-Suchdienste (llms.txt): nur feste Angaben aus content/site.ts, keine Preise (die pflegt das Admin-Panel)
export const dynamic = "force-static";

const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function GET() {
  const d = getDict("de");
  const u = (p: string) => `${site.url}${p}`;
  const hours = [...site.salonHours]
    .sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7))
    .map((h) => `${DAYS[h.weekday]} ${h.open ? `${h.open}–${h.close}` : "geschlossen"}`)
    .join(", ");
  const text = `# ${site.name}

> ${d.meta.siteDescription}

- Adresse: ${site.address.street}, ${site.address.zip} ${site.address.city}, Schweiz
- Telefon: ${site.phone}
- E-Mail: ${site.email}
- Öffnungszeiten: ${hours}
- Sprachen der Webseite: Deutsch, Französisch, Englisch
- Bezahlung im Salon: bar, Karte oder TWINT
- Instagram: ${site.instagram}

## Wichtige Seiten

- [Termin online buchen](${u(href("de", "booking"))})
- [Leistungen und Preise](${u(href("de", "services"))})
- [Der Salon](${u(href("de", "salon"))})
- [Zana, Inhaber](${u(href("de", "zana"))})
- [Häufige Fragen](${u(href("de", "faq"))})
- [Kontakt und Anfahrt](${u(href("de", "contact"))})
- [Français](${u("/fr")}) · [English](${u("/en")})

## Leistungen

${services.map((s) => `- [${s.name.de}](${u(servicePath("de", s))}): ${s.short.de}`).join("\n")}

## Journal

${posts.map((p) => `- [${p.title.de}](${u(postPath("de", p))})`).join("\n")}
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
