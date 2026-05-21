import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { getActiveArticles, type PublicArticle } from "@/src/actions/public";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Section "Actualités & Conseils" : 3 derniers articles publiés depuis Supabase.
 * Fallback statique si la table `articles` est vide.
 */

const FALLBACK_ARTICLES: PublicArticle[] = [
  {
    id: "fb-1",
    slug: "estimer-prix-bien-abidjan-2026",
    title: "Comment estimer le juste prix de votre bien à Abidjan en 2026",
    excerpt:
      "Méthode pas-à-pas pour fixer un prix de vente ou de location réaliste, basée sur les comparables, l'état du bien et la dynamique du quartier.",
    content_md: null,
    image: "/images/biens/bien15.jpg",
    category: "Guide propriétaire",
    read_time_minutes: 6,
    published_at: "2026-05-12T00:00:00Z",
    ordre: 1,
  },
  {
    id: "fb-2",
    slug: "top-5-quartiers-investir-abidjan",
    title: "Top 5 des quartiers où investir à Abidjan cette année",
    excerpt:
      "De Cocody Riviera à Marcory Zone 4 en passant par Bingerville, notre classement des zones avec le meilleur potentiel de plus-value.",
    content_md: null,
    image: "/images/biens/bien21.jpg",
    category: "Investissement",
    read_time_minutes: 8,
    published_at: "2026-04-28T00:00:00Z",
    ordre: 2,
  },
  {
    id: "fb-3",
    slug: "location-meublee-vs-vide-cote-ivoire",
    title: "Location meublée vs vide : quelle stratégie en Côte d'Ivoire ?",
    excerpt:
      "Fiscalité, rentabilité, profil de locataire, charges récurrentes : on compare les deux modèles pour vous aider à choisir.",
    content_md: null,
    image: "/images/biens/bien33.jpg",
    category: "Stratégie",
    read_time_minutes: 5,
    published_at: "2026-04-15T00:00:00Z",
    ordre: 3,
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogSection() {
  const fromDb = await getActiveArticles({ limit: 3 });
  const articles = fromDb.length > 0 ? fromDb : FALLBACK_ARTICLES;

  return (
    <MotionSection className="bg-[#FAF5EE] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Actualités & Conseils
            </p>
            <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Le marché immobilier décodé
            </h2>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              Tendances, guides pratiques, retours d&apos;expérience : nos
              experts partagent leur vision du marché abidjanais.
            </p>
          </div>
          <Link
            href="/contact_us"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all shrink-0"
          >
            Tous les conseils
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article) => (
            <MotionStaggerChild key={article.id}>
              <Link
                href={`/contact_us`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE] rounded-2xl"
              >
                <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {article.category && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {article.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.published_at)}
                      </span>
                      {article.read_time_minutes && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.read_time_minutes} min de lecture
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-agate text-xl text-secondary leading-snug group-hover:text-primary transition-colors mb-3">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                      Lire l&apos;article
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </article>
              </Link>
            </MotionStaggerChild>
          ))}
        </MotionStagger>
      </div>
    </MotionSection>
  );
}
