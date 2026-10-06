import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  experimental: { globalNotFound: true },
  // Optimierte Bilder lange zwischenspeichern (die Dateien ändern sich kaum)
  images: { minimumCacheTTL: 60 * 60 * 24 * 30 },
  async headers() {
    const week = "public, max-age=604800, stale-while-revalidate=86400";
    return [
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: week }] },
    ];
  },
};

export default nextConfig;
