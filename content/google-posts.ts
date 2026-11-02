/**
 * Tagesbeiträge fürs Google-Unternehmensprofil (lib/google-business.ts postet einen pro Tag, der Reihe nach).
 * Nur Fakten aus content/site.ts und db/services.json. Keine Telefonnummer und keine Links im Text,
 * sonst lehnt Google den Beitrag oft ab; der Link steht im Button.
 * key nie ändern (zeigt, was schon gepostet wurde). Neue Beiträge hinten anhängen.
 */
export type GooglePost = {
  key: string;
  /** Bild aus public/og (1200×630, eigene Salonfotos) */
  image: string;
  text: string;
  /** Pfad auf der Webseite für den Button */
  path: string;
  action: "BOOK" | "LEARN_MORE";
};

export const googlePosts: GooglePost[] = [
  {
    key: "haarschnitt",
    image: "/og/cut-standard.jpg",
    text: "Herren Haarschnitt bei GYAN in Biel: Beratung, Schnitt mit Schere und Maschine, saubere Konturen. CHF 40, in rund 20 Minuten. Ob Seitenscheitel, Low Fade oder Skin Fade, wir schauen zuerst, wie dein Haar wächst. Zentralstrasse 22, Biel. Termin online buchen.",
    path: "/de/termin",
    action: "BOOK",
  },
  {
    key: "oeffnungszeiten",
    image: "/og/salon-empfang.jpg",
    text: "Unsere Öffnungszeiten: Montag bis Mittwoch 9 bis 19 Uhr, Donnerstag und Freitag 9 bis 20 Uhr, Samstag 8.30 bis 18 Uhr. Sonntag geschlossen. Termin online buchen oder einfach vorbeikommen. GYAN Hair Salon, Zentralstrasse 22, Biel.",
    path: "/de/termin",
    action: "BOOK",
  },
  {
    key: "signature",
    image: "/og/signatur.jpg",
    text: "GYAN Signature Cut: Haarschnitt plus individuelles Styling und Tipps, wie du es zu Hause selbst stylst. CHF 45, rund 25 Minuten. Für alle, die morgens in fünf Minuten fertig sein wollen und trotzdem gut aussehen.",
    path: "/de/leistungen/gyan-signature",
    action: "LEARN_MORE",
  },
  {
    key: "bart",
    image: "/og/cut-bart.jpg",
    text: "Bart Trim bei GYAN: Bart in Form gebracht, Konturen mit der Klinge. CHF 20, rund 15 Minuten. Zusammen mit dem Haarschnitt im GYAN Classic Paket für CHF 65. Zentralstrasse 22, Biel.",
    path: "/de/termin",
    action: "BOOK",
  },
  {
    key: "rasur",
    image: "/og/salon-barbershop.jpg",
    text: "Bart Rasur mit Hot Towel: Nassrasur mit heissem Tuch, Schaum und Pflege. CHF 28, rund 20 Minuten. Zwanzig Minuten nur für dich, mitten in Biel.",
    path: "/de/leistungen/nassrasur-biel",
    action: "LEARN_MORE",
  },
  {
    key: "premium",
    image: "/og/salon-spiegel.jpg",
    text: "GYAN Premium Paket: Haarschnitt, Bart, Wäsche und Styling in einem Termin. CHF 75, rund 40 Minuten. Das Rundum-Paket, wenn es mehr sein darf als nur ein Schnitt.",
    path: "/de/leistungen/gyan-premium-paket",
    action: "LEARN_MORE",
  },
  {
    key: "gutschein",
    image: "/og/gutschein-kuverts.jpg",
    text: "Ein Geschenk, das sitzt: GYAN Gutscheine mit frei wählbarem Betrag. Erhältlich im Salon an der Zentralstrasse 22 in Biel, alle Infos auf unserer Webseite.",
    path: "/de/gutschein",
    action: "LEARN_MORE",
  },
  {
    key: "fade",
    image: "/og/hero-fade.jpg",
    text: "Low Fade, Mid Fade oder Skin Fade: Saubere Übergänge brauchen Zeit und eine ruhige Hand. Bei GYAN beginnt jeder Schnitt mit einem kurzen Gespräch, damit du genau den Fade bekommst, den du willst. Herren Haarschnitt CHF 40.",
    path: "/de/termin",
    action: "BOOK",
  },
  {
    key: "full-service",
    image: "/og/salon-lounge.jpg",
    text: "GYAN Full Service: Haarschnitt, Bart, Face Treatment, Wäsche und Styling. CHF 90, rund 50 Minuten. Unser komplettes Programm für den grossen Auftritt.",
    path: "/de/leistungen/gyan-full-service",
    action: "LEARN_MORE",
  },
  {
    key: "face",
    image: "/og/salon-wasch.jpg",
    text: "GYAN Face Treatment: Hot Towel, Reinigung und Pflege. CHF 25, rund 20 Minuten. Passt perfekt nach dem Haarschnitt oder als kurze Pause vom Alltag.",
    path: "/de/leistungen/gesichtspflege-biel",
    action: "LEARN_MORE",
  },
  {
    key: "abends",
    image: "/og/salon-empfang-2.jpg",
    text: "Nach der Arbeit noch zum Coiffeur? Donnerstag und Freitag sind wir bis 20 Uhr für dich da, Samstag schon ab 8.30 Uhr. Termin online in einer Minute gebucht. GYAN Hair Salon, Zentralstrasse 22, Biel.",
    path: "/de/termin",
    action: "BOOK",
  },
  {
    key: "classic",
    image: "/og/cut-mulet.jpg",
    text: "GYAN Classic Paket: Haarschnitt und Bart in einem Termin. CHF 65, rund 30 Minuten. Der Klassiker für alle, die Haar und Bart gleichzeitig in Form bringen wollen.",
    path: "/de/leistungen/haarschnitt-und-bart",
    action: "LEARN_MORE",
  },
  {
    key: "bewertungen",
    image: "/og/zana-barbershop.jpg",
    text: "Danke für 4,9 Sterne aus 290 Google-Bewertungen! Euer Feedback treibt uns jeden Tag an. Wir freuen uns auf deinen nächsten Besuch an der Zentralstrasse 22 in Biel.",
    path: "/de/termin",
    action: "BOOK",
  },
];
