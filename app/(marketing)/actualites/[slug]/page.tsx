import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getActiveArticles,
  getArticleBySlug,
} from "@/src/actions/public";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";
import { ArticleMarkdown } from "./article-markdown";
import { EmplacementPub } from "@/components/publicites/emplacement-pub";
import { ArticleSections, preparerSections } from "./article-sections";
import { getSiteContact } from "@/src/lib/site-contact";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: `${article.title} | Agence Mirna`,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Le formulaire d'article accepte encore une adresse saisie à la main, et
  // next/image LÈVE sur un hôte absent des `remotePatterns` au lieu de
  // l'ignorer : la couverture est filtrée avant de lui être passée.
  const couverture = normaliserUrlImage(article.image);

  // Le corps de l'article vient des sections (migration 0023). `content_md` ne
  // sert plus qu'au repli ci-dessous, le temps que la migration soit appliquée
  // partout.
  const sections = preparerSections(article.sections);
  const ancienContenu = (article.content_md ?? "").trim();

  // Récupère 3 autres articles pour "À lire aussi"
  const others = (await getActiveArticles({ limit: 6 }))
    .filter((a) => a.slug !== slug)
    .slice(0, 3)
    .map((a) => ({ ...a, image: normaliserUrlImage(a.image) ?? null }));

  const contact = await getSiteContact();

  return (
    <main className="bg-[#FAF5EE]">
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: article.title, url: `/actualites/${article.slug}` },
        ]}
      />
      {/* HERO ARTICLE */}
      <section className="relative pt-40 sm:pt-48 pb-12 sm:pt-48 sm:pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-primary transition-colors bg-white border border-stone-200 px-4 py-1.5 rounded-full shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>

            {article.category && (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {article.category}
              </div>
            )}
          </div>

          <h1 className="font-agate text-4xl sm:text-5xl md:text-6xl font-bold text-secondary leading-[1.1]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-6 text-lg sm:text-xl text-neutral-700 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="mt-8 flex items-center gap-4 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(article.published_at)}
            </span>
            {article.read_time_minutes && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {article.read_time_minutes} min de lecture
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* IMAGE COVER */}
      <section className="px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl bg-stone-100">
            {couverture && (
              <Image
                src={couverture}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {sections.length > 0 ? (
            <ArticleSections sections={sections} titreArticle={article.title} />
          ) : !article.sectionsDisponibles && ancienContenu ? (
            // Repli réservé au cas où la LECTURE des sections a échoué
            // (migration 0023 pas encore appliquée) : l'article reste lisible
            // au lieu d'un message d'attente alors que son texte existe.
            // Sans la condition `sectionsDisponibles`, un article que le
            // rédacteur vient de vider de toutes ses sections aurait vu
            // réapparaître son ancien texte — `content_md` est conservée
            // indéfiniment par la migration.
            <ArticleMarkdown source={ancienContenu} />
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <p className="text-neutral-600">
                Le contenu complet de cet article sera bientôt disponible.
                En attendant, contactez-nous pour échanger directement avec
                un expert.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="rounded-full">
                  <Link
                    href={
                      contact.whatsappMessageUrl ||
                      process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                      "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discuter sur WhatsApp
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/contact_us">Nous contacter</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <EmplacementPub cle="article-bas" className="mx-auto max-w-3xl px-6 pb-16 lg:px-8" />

      {/* ARTICLES À LIRE AUSSI */}
      {others.length > 0 && (
        <section className="pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                À lire aussi
              </p>
              <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary">
                Plus de conseils du marché
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/actualites/${other.slug}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-2xl"
                >
                  <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      {other.image && (
                        <Image
                          src={other.image}
                          alt={other.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      {other.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {other.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col p-5">
                      <div className="text-xs text-neutral-500 mb-2">
                        {formatDate(other.published_at)}
                      </div>
                      <h3 className="font-agate text-lg text-secondary leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {other.title}
                      </h3>
                      {other.excerpt && (
                        <p className="text-sm text-neutral-600 line-clamp-2 flex-1">
                          {other.excerpt}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        Lire
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
