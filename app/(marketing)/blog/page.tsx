import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { EmplacementPub } from "@/components/publicites/emplacement-pub";
import { getActiveArticles } from "@/src/actions/public";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";

/**
 * Page publique /blog : liste complète des articles publiés.
 *
 * Le repli statique était pire que l'absence d'article : ses slugs n'existent
 * pas en base, or les cartes émettent `/actualites/<slug>` et la route de
 * détail fait `notFound()` dès que `getArticleBySlug` ne trouve rien. Tant que
 * la table `articles` ne renvoie rien, 100 % des liens de la page étaient donc
 * morts. On assume désormais l'état vide, avec un renvoi vers le contact.
 */

export const metadata = {
  title: "Blog | Agence Mirna",
  description:
    "Conseils, guides et actualités du marché immobilier à Abidjan par les experts d'Agence Mirna.",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  // Le formulaire d'article accepte encore une adresse saisie à la main, et
  // next/image LÈVE sur un hôte absent des `remotePatterns` au lieu de
  // l'ignorer : on filtre la source une fois ici plutôt qu'à chaque rendu.
  const articles = (await getActiveArticles()).map((article) => ({
    ...article,
    image: normaliserUrlImage(article.image) ?? null,
  }));

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
      <section className="relative pt-40 sm:pt-48 pb-12 sm:pt-48 sm:pb-16">
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

      <EmplacementPub cle="blog-haut" className="mx-auto max-w-6xl px-6 pb-12 lg:px-8" />

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
                  {featured.image && (
                    <Image
                      src={featured.image}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  )}
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

      {/* AUCUN ARTICLE PUBLIÉ */}
      {articles.length === 0 && (
        <section className="pb-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-10 sm:p-14 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#FAF5EE] text-primary mb-5">
                <Newspaper className="h-6 w-6" />
              </div>
              <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary">
                Aucun article publié pour le moment
              </h2>
              <p className="mt-4 text-base text-neutral-700 leading-relaxed">
                Nos guides sont en cours de rédaction. D&apos;ici là, nos
                conseillers répondent directement à vos questions sur le marché
                immobilier abidjanais.
              </p>
              <Link
                href="/contact_us"
                className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#1B3C35] px-6 py-3 text-sm font-semibold text-white hover:bg-[#152e29] transition-colors"
              >
                Nous poser une question
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
                      {article.image && (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
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
