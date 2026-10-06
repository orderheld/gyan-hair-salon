import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "GYAN Hair Salon · Herren Coiffeur in Biel",
    template: "%s · GYAN Hair Salon Biel",
  },
  description:
    "Herren Coiffeur in Biel/Bienne. Haarschnitt, Fade, Bart und Rasur bei Inhaber Zana persönlich. Termin online buchen und sofort bestätigt erhalten.",
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: site.name,
    title: "GYAN Hair Salon · Herren Coiffeur in Biel",
    description: "Präzision, Ruhe und Zeit für dich. Termin bei Zana online buchen.",
  },
};

export const viewport: Viewport = { themeColor: "#fbf9f5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
