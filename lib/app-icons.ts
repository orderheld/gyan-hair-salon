import type { Metadata } from "next";

// Icons der Webseite (Browser-Tab, Home-Bildschirm). Das Admin hat eigene in app/admin/layout.tsx.
export const APP_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/icons/favicon.svg", type: "image/svg+xml" },
    { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
  ],
  apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
};
