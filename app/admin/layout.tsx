import type { Metadata, Viewport } from "next";
import { display, inter } from "@/lib/fonts";
import { AdminResume } from "@/components/admin/AdminResume";
import { getAdminLocale } from "@/lib/admin";
import "../styles/base.css";
import "../styles/admin.css";


export const metadata: Metadata = {
  title: "GYAN Admin",
  robots: { index: false, follow: false },
  applicationName: "GYAN Admin",
  manifest: "/admin/app.webmanifest",
  icons: {
    icon: [{ url: "/icons/admin-favicon.svg", type: "image/svg+xml" }, { url: "/icons/admin-favicon-48.png", sizes: "48x48", type: "image/png" }],
    apple: [{ url: "/icons/admin-apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "GYAN Admin", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#fbf9f5", width: "device-width", initialScale: 1, viewportFit: "cover" };
export const dynamic = "force-dynamic";

export default async function AdminRoot({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  return (
    <html data-scroll-behavior="smooth" lang={locale} className={`${inter.variable} ${display.variable}`}>
      <body>
        <AdminResume />
        {children}
      </body>
    </html>
  );
}
