// Kontaktangaben und feste Daten des Salons. Texte stehen in lib/i18n/dict/{de,fr,en}.ts.
import type { L } from "./types";

export const site = {
  name: "GYAN Hair Salon",
  shortName: "GYAN",
  owner: "Zana",
  // Handelsregister (Moneyhouse/Zefix): Einzelfirma, eingetragen 05.09.2025
  legalName: "GYAN SALON Inh. Ali",
  ownerFull: "Zana Ali",
  uid: "CHE-370.741.994",
  founded: 2025,
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gyanhairsalon.ch").replace(/\/$/, ""),
  address: {
    street: "Zentralstrasse 22",
    zip: "2502",
    city: "Biel/Bienne",
    region: "BE",
    country: "CH",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=GYAN+Hair+Salon+Zentralstrasse+22+2502+Biel",
  },
  /** Koordinaten des Eingangs (geo.admin.ch, Gebäudeadresse Zentralstrasse 22) */
  geo: { latitude: 47.13862, longitude: 7.24472 },
  phone: "+41 76 505 74 47",
  phoneHref: "tel:+41765057447",
  email: "contact@gyanhairsalon.ch",
  instagram: "https://www.instagram.com/gyan_hair_salon/",
  instagramHandle: "@gyan_hair_salon",
  /**
   * Öffnungszeiten des Salons wie im Google-Unternehmensprofil (0 = Sonntag).
   * Für die Anzeige auf der Webseite, «Jetzt offen» und Google-Daten.
   * Die Online-Buchungszeiten stellt das Admin-Panel separat ein.
   */
  salonHours: [
    { weekday: 1, open: "09:00", close: "19:00" },
    { weekday: 2, open: "09:00", close: "19:00" },
    { weekday: 3, open: "09:00", close: "19:00" },
    { weekday: 4, open: "09:00", close: "20:00" },
    { weekday: 5, open: "09:00", close: "20:00" },
    { weekday: 6, open: "08:30", close: "18:00" },
    { weekday: 0, open: null, close: null },
  ] as { weekday: number; open: string | null; close: string | null }[],
  tiktok: "https://www.tiktok.com/@gyan_hair_salon",
  tiktokHandle: "@gyan_hair_salon",
  facebook: "https://www.facebook.com/GyanHairSalon",
  facebookHandle: "GyanHairSalon",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=GYAN+Hair+Salon+Biel",
  /** Direktlink «Bewertung schreiben» aus dem Google-Unternehmensprofil */
  googleWriteReviewUrl: "https://g.page/r/Cf88NjkyEn2REBM/review",
  rating: { value: "4.9", count: "290" }, // von Ferhat am 7.10.2026 bestätigt

  /** Online-Buchung: nur Zana buchbar, Hikmet folgt (bis dahin spontan) */
  team: [
    { id: "zana", name: "Zana", bookable: true },
    { id: "hikmet", name: "Hikmet", bookable: false },
  ] as { id: "zana" | "hikmet"; name: string; bookable: boolean }[],

  // Bilder unter public/images
  images: {
    hero: "/images/salon-spiegel.jpg",
    lounge: "/images/salon-lounge.jpg",
    wash: "/images/salon-wasch.jpg",
    reception: "/images/salon-empfang-2.jpg",
    zana: "/images/zana-illustration.jpg",
    /** Grosses Bild im Zana-Teil (Startseite und Zana-Seite) */
    zanaMain: "/images/zana-barbershop.jpg",
    signature: "/images/signatur.jpg",
    work: ["/images/cut-mulet.jpg", "/images/cut-standard.jpg", "/images/cut-fade.jpg", "/images/cut-bart.jpg", "/images/cut-nacken.jpg", "/images/signatur.jpg"],
    // Bild pro Leistung, falls im Admin keines gesetzt ist (Stichwort im deutschen Slug)
    serviceFallback: [
      ["fade", "/images/cut-fade.jpg"],
      ["und-bart", "/images/cut-mulet.jpg"],
      ["bart", "/images/cut-bart.jpg"],
      ["rasur", "/images/salon-spiegel.jpg"],
      ["gesicht", "/images/salon-wasch.jpg"],
      ["full-service", "/images/salon-lounge.jpg"],
      ["paket", "/images/salon-spiegel.jpg"],
      ["signature", "/images/signatur.jpg"],
      ["", "/images/cut-standard.jpg"],
    ] as [string, string][],
    // Ausschnitte sind für grosse Flächen zu klein: dort das Originalbild nehmen
    large: { "/images/cut-fade.jpg": "/images/cut-mulet.jpg", "/images/cut-bart.jpg": "/images/cut-mulet.jpg", "/images/cut-nacken.jpg": "/images/cut-standard.jpg" } as Record<string, string>,
  },

  /**
   * Bildbeschreibungen (alt-Text) pro Bild: was darauf zu sehen ist, kurz und ohne Stichwortlisten.
   * Wird für Bilder auf der Seite und für Vorschaubilder (Open Graph) verwendet.
   */
  imageAlt: {
    "/images/cut-bart.jpg": { de: "Mann im Profil mit kurz getrimmtem Vollbart und scharfen Konturen", fr: "Homme de profil avec une barbe courte taillée et des contours nets", en: "Man in profile with a short, trimmed full beard and sharp lines" },
    "/images/cut-fade.jpg": { de: "Nahaufnahme eines Low Fade, sauber bis auf die Haut verblendet", fr: "Gros plan d'un low fade, dégradé net jusqu'à la peau", en: "Close-up of a low fade, cleanly blended down to the skin" },
    "/images/cut-mulet.jpg": { de: "Moderner Mullet mit Fade an den Seiten und Bart, frisch geschnitten bei GYAN", fr: "Mulet moderne avec dégradé sur les côtés et barbe, fraîchement coupé chez GYAN", en: "Modern mullet with faded sides and a beard, freshly cut at GYAN" },
    "/images/cut-nacken.jpg": { de: "Sauber ausrasierter Nacken nach dem Haarschnitt", fr: "Nuque nette après la coupe", en: "Clean neckline after the haircut" },
    "/images/cut-standard.jpg": { de: "Klassischer Herrenschnitt mit Taper an den Seiten, im Spiegel des Salons", fr: "Coupe homme classique avec taper sur les côtés, dans le miroir du salon", en: "Classic men's cut with a tapered side, seen in the salon mirror" },
    "/images/hero-fade.jpg": { de: "Fade und Nackenkontur von hinten, im skulpturalen Spiegel", fr: "Dégradé et contour de nuque vus de dos, dans le miroir sculptural", en: "Fade and neckline from behind, in the sculptural mirror" },
    "/images/salon-empfang.jpg": { de: "Empfang von GYAN Hair Salon mit Waschplatz und GYAN-Logo am Bildschirm", fr: "Accueil de GYAN Hair Salon avec bac à shampoing et logo GYAN à l'écran", en: "GYAN Hair Salon reception with wash station and the GYAN logo on screen" },
    "/images/salon-empfang-2.jpg": { de: "Empfang von GYAN Hair Salon mit Waschplatz und GYAN-Logo am Bildschirm", fr: "Accueil de GYAN Hair Salon avec bac à shampoing et logo GYAN à l'écran", en: "GYAN Hair Salon reception with wash station and the GYAN logo on screen" },
    "/images/salon-lounge.jpg": { de: "Heller Salon an der Zentralstrasse in Biel mit Lounge, Spiegeln und Barberstühlen", fr: "Salon lumineux à la Zentralstrasse à Bienne avec lounge, miroirs et fauteuils de barbier", en: "Bright salon on Zentralstrasse in Biel with lounge, mirrors and barber chairs" },
    "/images/salon-spiegel.jpg": { de: "Skulpturale Spiegel und Barberstühle im GYAN Hair Salon Biel", fr: "Miroirs sculpturaux et fauteuils de barbier chez GYAN Hair Salon à Bienne", en: "Sculptural mirrors and barber chairs at GYAN Hair Salon in Biel" },
    "/images/salon-wasch.jpg": { de: "Waschplatz mit Ledersessel für Haarwäsche und Pflege", fr: "Bac à shampoing avec fauteuil en cuir pour le lavage et les soins", en: "Wash station with leather chair for hair wash and care" },
    "/images/signatur.jpg": { de: "GYAN-Schriftzug an der Wand mit Zanas Unterschrift", fr: "Lettrage GYAN au mur avec la signature de Zana", en: "GYAN lettering on the wall with Zana's signature" },
    "/images/zana-barbershop.jpg": { de: "Barbershop-Ecke im GYAN Hair Salon mit Pflanzen und Teppichbild", fr: "Coin barbershop chez GYAN Hair Salon avec plantes et tapis encadré", en: "Barbershop corner at GYAN Hair Salon with plants and a framed rug" },
    "/images/zana-illustration.jpg": { de: "Illustration von Zana, Inhaber von GYAN Hair Salon", fr: "Illustration de Zana, propriétaire de GYAN Hair Salon", en: "Illustration of Zana, owner of GYAN Hair Salon" },
    "/images/zana-portrait-art.jpg": { de: "GYAN-Logo mit Zanas Porträt als Kunstwerk", fr: "Logo GYAN avec le portrait de Zana en œuvre d'art", en: "GYAN logo with Zana's portrait as artwork" },
  } as Record<string, L>,
};

export type Site = typeof site;

/** Name der Person, bei der ein Termin gebucht ist (Standard: Inhaber) */
export const staffName = (id: string | null | undefined) => site.team.find((t) => t.id === id)?.name ?? site.owner;
