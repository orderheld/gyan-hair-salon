import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/*/termin/ok", "/*/termin/storno", "/*/reservation/ok", "/*/reservation/storno", "/*/booking/ok", "/*/booking/storno"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
