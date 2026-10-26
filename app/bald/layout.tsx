import type { Metadata, Viewport } from "next";
import { display, inter, serif } from "@/lib/fonts";
import { site } from "@/content/site";
import { APP_ICONS } from "@/lib/app-icons";
import "../styles/base.css";
import "../styles/site.css";

// Eigene Wurzel ohne Menü und Footer: nur die Coming-soon-Seite

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  robots: { index: false, follow: false },
  manifest: "/site.webmanifest",
  icons: APP_ICONS,
  appleWebApp: { capable: true, title: "GYAN", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1, viewportFit: "cover" };
export const dynamic = "force-dynamic";

export default function SoonRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${display.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
