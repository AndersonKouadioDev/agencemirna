import type { MetadataRoute } from "next";
import { getAllBiens } from "@/src/actions/bien.actions";
import {
  getActiveServices,
  getActiveArticles,
} from "@/src/actions/public";

/**
 * Génère /sitemap.xml dynamiquement avec :
 *   - 8 routes statiques publiques (home, properties, services, etc.)
 *   - 1 route par bien actif
 *   - 1 route par service actif (via slug)
 *   - 1 route par article publié (via slug)
 *
 * Next.js le sert avec headers cache appropriés. Soumis à Google
 * Search Console une fois et il sera re-crawlé automatiquement.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";
  const now = new Date();

  // ─── Routes statiques publiques ────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/estimation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact_us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ─── Routes dynamiques (fetch en parallèle, échec gracieux) ────────
  const [biens, services, articles] = await Promise.all([
    getAllBiens().catch(() => []),
    getActiveServices().catch(() => []),
    getActiveArticles().catch(() => []),
  ]);

  const bienRoutes: MetadataRoute.Sitemap = (biens ?? []).map((b: any) => ({
    url: `${baseUrl}/properties/${b.id}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/actualites/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...bienRoutes, ...serviceRoutes, ...articleRoutes];
}
