import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  experimental: { globalNotFound: true },
  // Optimierte Bilder lange zwischenspeichern (die Dateien ändern sich kaum)
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 60 * 60 * 24 * 30 },
  async headers() {
    const week = "public, max-age=604800, stale-while-revalidate=86400";
    // Sicherheits-Header für alle Seiten. Kamera bleibt für die eigene Seite erlaubt (QR-Scan in Kasse/Stempelkarte).
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/og/:path*", headers: [{ key: "Cache-Control", value: week }] },
    ];
  },
};

export default nextConfig;
