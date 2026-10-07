// Kontaktangaben und feste Daten des Salons. Texte stehen in lib/i18n/dict/{de,fr,en}.ts.

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
  phone: "+41 76 505 74 47",
  phoneHref: "tel:+41765057447",
  email: "info@gyanhairsalon.ch", // PLATZHALTER
  instagram: "https://www.instagram.com/gyan_hair_salon/",
  instagramHandle: "@gyan_hair_salon",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=GYAN+Hair+Salon+Biel",
  /** Direktlink «Bewertung schreiben» aus dem Google-Unternehmensprofil */
  googleWriteReviewUrl: "https://g.page/r/Cf88NjkyEn2REBM/review",
  rating: { value: "4.9", count: "290" }, // vor Livegang mit Google abgleichen

  // Bilder unter public/images
  images: {
    hero: "/images/salon-spiegel.jpg",
    lounge: "/images/salon-lounge.jpg",
    wash: "/images/salon-wasch.jpg",
    reception: "/images/salon-empfang.jpg",
    zana: "/images/zana-portrait-art.jpg",
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
};

export type Site = typeof site;
