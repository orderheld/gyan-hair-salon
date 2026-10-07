// Eigenes App-Manifest fürs Admin-Panel: eigenes Icon, startet direkt bei den Terminen
export function GET() {
  const manifest = {
    id: "/admin",
    name: "GYAN Admin",
    short_name: "GYAN Admin",
    description: "Termine, Leistungen und Zeiten von GYAN Hair Salon",
    start_url: "/admin/start",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3ece1",
    theme_color: "#fbf9f5",
    icons: [
      { src: "/icons/admin-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/admin-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/admin-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Termine", url: "/admin", icons: [{ src: "/icons/admin-192.png", sizes: "192x192" }] },
      { name: "Kasse", url: "/admin/kasse", icons: [{ src: "/icons/admin-192.png", sizes: "192x192" }] },
      { name: "Leistungen & Preise", url: "/admin/leistungen", icons: [{ src: "/icons/admin-192.png", sizes: "192x192" }] },
      { name: "Zeiten & Sperren", url: "/admin/zeiten", icons: [{ src: "/icons/admin-192.png", sizes: "192x192" }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
