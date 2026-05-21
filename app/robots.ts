import type { MetadataRoute } from "next";

/**
 * Génère /robots.txt dynamiquement.
 * - Tout indexable par défaut
 * - /admin/* et /api/* exclus (pas de SEO sur l'admin)
 * - Référence le sitemap pour Google
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
