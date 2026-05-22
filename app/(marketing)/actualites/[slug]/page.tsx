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
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";

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

  // Récupère 3 autres articles pour "À lire aussi"
  const others = (await getActiveArticles({ limit: 6 })).filter(
    (a) => a.slug !== slug,
  ).slice(0, 3);

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
      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>

          {article.category && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-5">
              <Sparkles className="h-3 w-3" />
              {article.category}
            </div>
          )}

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
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {article.content_md ? (
            <div className="prose prose-lg prose-neutral max-w-none whitespace-pre-wrap text-neutral-800 leading-relaxed">
              {article.content_md}
            </div>
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
                      process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                      "https://wa.me/22501434831131"
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
                      <Image
                        src={other.image}
                        alt={other.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
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
