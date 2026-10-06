import type { MetadataRoute } from "next";
import { comingSoon } from "@/lib/coming-soon";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (comingSoon()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/*/termin/ok", "/*/termin/storno", "/*/reservation/ok", "/*/reservation/storno", "/*/booking/ok", "/*/booking/storno"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
