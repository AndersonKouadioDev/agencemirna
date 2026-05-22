import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import {
  getActiveArticles,
  type PublicArticle,
} from "@/src/actions/public";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";

/**
 * Page publique /blog : liste complète des articles publiés.
 * Fallback statique si la table `articles` est vide (réutilise les
 * mêmes articles que BlogSection sur la home pour éviter "Aucun article").
 */

export const metadata = {
  title: "Blog | Agence Mirna",
  description:
    "Conseils, guides et actualités du marché immobilier à Abidjan par les experts d'Agence Mirna.",
};

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
    image: "/images/biens/bien8.jpg",
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

export default async function BlogPage() {
  const fromDb = await getActiveArticles();
  const articles = fromDb.length > 0 ? fromDb : FALLBACK_ARTICLES;

  const [featured, ...rest] = articles;

  return (
    <main className="bg-[#FAF5EE]">
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />

      {/* HERO */}
      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-5">
            <Newspaper className="h-3.5 w-3.5" />
            Le marché immobilier décodé
          </div>
          <h1 className="font-agate text-4xl sm:text-5xl md:text-6xl font-bold text-secondary leading-[1.1]">
            Conseils, tendances & guides
          </h1>
          <p className="mt-6 text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Nos experts partagent leur vision du marché abidjanais : guides
            pratiques, retours d&apos;expérience, analyses de quartiers.
          </p>
        </div>
      </section>

      {/* ARTICLE EN VEDETTE */}
      {featured && (
        <section className="pb-12 sm:pb-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <Link
              href={`/actualites/${featured.slug}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-3xl"
            >
              <article className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-stone-200 group-hover:shadow-2xl transition-shadow duration-300">
                <div className="relative aspect-[16/10] lg:aspect-auto bg-stone-100 overflow-hidden">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  {featured.category && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {featured.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                    À la une
                  </div>
                  <h2 className="font-agate text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary leading-tight group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-4 text-base text-neutral-700 leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-4 text-sm text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(featured.published_at)}
                    </span>
                    {featured.read_time_minutes && (
                      <>
                        <span className="text-neutral-300">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {featured.read_time_minutes} min
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Lire l&apos;article complet
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* GRILLE DES AUTRES ARTICLES */}
      {rest.length > 0 && (
        <section className="pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary">
                Tous les articles
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {rest.length + 1} article{articles.length > 1 ? "s" : ""} publié
                {articles.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/actualites/${article.slug}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE] rounded-2xl"
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
                              {article.read_time_minutes} min
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
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
