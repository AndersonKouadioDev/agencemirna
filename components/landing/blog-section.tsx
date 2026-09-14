import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { getActiveArticles } from "@/src/actions/public";
import { normaliserUrlImage } from "@/src/lib/image-url";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Section « Actualités & Conseils » de la page À propos : les 3 derniers
 * articles publiés.
 *
 * Le repli statique de trois cartes était pire que l'absence d'article : ses
 * slugs n'existent pas en base, or chaque carte émet `/actualites/<slug>` et
 * la route de détail applique exactement les mêmes filtres que la liste. Dès
 * que la liste revenait vide — tous les articles dépubliés ou programmés plus
 * tard — les trois liens affichés étaient donc garantis 404. On assume
 * désormais l'état vide avec un bloc non cliquable.
 */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogSection() {
  // Le formulaire d'article accepte encore une adresse saisie à la main, et
  // next/image LÈVE sur un hôte absent des `remotePatterns` au lieu de
  // l'ignorer : on filtre la source une fois ici plutôt qu'à chaque rendu.
  const articles = (await getActiveArticles({ limit: 3 })).map((article) => ({
    ...article,
    image: normaliserUrlImage(article.image) ?? null,
  }));

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
            href={articles.length > 0 ? "/blog" : "/contact_us"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all shrink-0"
          >
            {articles.length > 0 ? "Tous les conseils" : "Nous poser une question"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {articles.length === 0 ? (
          /* Aucun article publié : un bloc non cliquable, pour ne promettre
             aucune lecture qui finirait en 404. */
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-10 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#FAF5EE] text-primary mb-5">
              <Newspaper className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-agate text-2xl font-bold text-secondary">
              Nos premiers guides arrivent bientôt
            </h3>
            <p className="mt-3 text-base text-neutral-700 leading-relaxed max-w-xl mx-auto">
              Aucun article n&apos;est publié pour le moment. En attendant, nos
              conseillers répondent directement à vos questions sur le marché
              abidjanais.
            </p>
          </div>
        ) : (
          <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <MotionStaggerChild key={article.id}>
                <Link
                  href={`/actualites/${article.slug}`}
                  className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE] rounded-2xl"
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
        )}
      </div>
    </MotionSection>
  );
}
