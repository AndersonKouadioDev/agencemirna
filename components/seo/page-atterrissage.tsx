import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertySection from "@/components/properties/property-section";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";
import { getAllBiens, type BienPublicRow } from "@/src/actions/bien.actions";
import { getSiteContact } from "@/src/lib/site-contact";
import {
  LISTE_PAGES_SEO,
  type PageSeo,
  type SectionSeo,
  type TexteDynamique,
} from "@/src/data/pages-seo";
import { filtrerBiens, statsBiens, type StatsBiens } from "@/src/lib/pages-seo";
import { cn } from "@/lib/utils";

/**
 * Gabarit des pages d'atterrissage SEO (contenu dans src/data/pages-seo.ts).
 *
 * Ordre pensé pour la recherche : la réponse d'abord (les biens, avec le prix
 * « à partir de »), puis le texte qui aide à choisir, puis la FAQ. Les biens
 * sont relus à chaque visite, comme le catalogue.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

export function metadataPageSeo(page: PageSeo): Metadata {
  return {
    title: page.titre,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    // `openGraph` remplace celui du layout en entier : tout est redonné ici.
    openGraph: {
      type: "website",
      locale: "fr_CI",
      siteName: "AGENCE MIRNA",
      url: `/${page.slug}`,
      title: `${page.titre} | Agence Mirna`,
      description: page.description,
      images: [{ url: page.image.src, alt: page.image.alt }],
    },
  };
}

const resoudre = (t: TexteDynamique, stats: StatsBiens) =>
  typeof t === "function" ? t(stats) : t;

function FaqJsonLd({ faq }: { faq: { question: string; reponse: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.reponse },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export async function PageAtterrissage({ page }: { page: PageSeo }) {
  const [tousLesBiens, contact] = await Promise.all([
    getAllBiens(),
    getSiteContact(),
  ]);
  return (
    <ContenuPageAtterrissage
      page={page}
      tousLesBiens={tousLesBiens}
      whatsappUrl={contact.whatsappUrl}
    />
  );
}

/** Rendu seul, sans accès aux données : testable avec des biens fournis. */
export function ContenuPageAtterrissage({
  page,
  tousLesBiens,
  whatsappUrl,
}: {
  page: PageSeo;
  tousLesBiens: BienPublicRow[];
  whatsappUrl: string | null;
}) {
  // Les chiffres portent sur TOUS les biens du filtre, même si la grille
  // n'en montre qu'une partie (`max`).
  const correspondants = filtrerBiens(tousLesBiens, page.biens.filtre);
  const stats = statsBiens(correspondants);
  const principaux = page.biens.max
    ? correspondants.slice(0, page.biens.max)
    : correspondants;

  const secondaires = page.biensSecondaires
    ? filtrerBiens(tousLesBiens, page.biensSecondaires.filtre, {
        exclure: new Set(principaux.map((b) => b.id)),
        max: page.biensSecondaires.max ?? 6,
      })
    : [];

  // Tout est loué pour ce filtre : on montre le reste de la location meublée
  // plutôt qu'une page sans aucun bien.
  const repli =
    principaux.length === 0 && secondaires.length === 0
      ? filtrerBiens(tousLesBiens, "location-meublee", { max: 6 })
      : [];

  const faq = page.faq.map((f) => ({
    question: f.question,
    reponse: resoudre(f.reponse, stats),
  }));

  const whatsapp = whatsappUrl
    ? `${whatsappUrl}?text=${encodeURIComponent(
        `Bonjour Agence Mirna, je vous contacte depuis la page « ${page.h1} » : ${SITE_URL}/${page.slug}`,
      )}`
    : null;

  const boutonPrincipal = page.boutonPrincipal ?? {
    libelle: "Voir les logements",
    href: "#biens",
  };

  const chiffres = page.masquerChiffres
    ? []
    : [
        stats.nombre > 0 &&
          `${stats.nombre} logement${stats.nombre > 1 ? "s" : ""} en ligne`,
        stats.prixNuitMin && `Dès ${stats.prixNuitMin} la nuit`,
        stats.prixMoisMin && `Dès ${stats.prixMoisMin} le mois`,
      ].filter((c): c is string => Boolean(c));

  const autresPages = LISTE_PAGES_SEO.filter((p) => p.slug !== page.slug);

  return (
    <main className="bg-[#FAF5EE]">
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: page.h1, url: `/${page.slug}` },
        ]}
      />
      <FaqJsonLd faq={faq} />

      {/* Bandeau */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={page.image.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,31,15,0.88) 0%, rgba(45,31,15,0.7) 55%, rgba(212,145,68,0.55) 100%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-6xl px-6 lg:px-8 pt-44 sm:pt-52 pb-20 sm:pb-28 text-white">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-2 text-sm text-white/80 mb-8"
          >
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{page.lienCourt}</span>
          </nav>

          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
              {page.surtitre}
            </p>
            <h1 className="font-agate text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              {page.h1}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
              {page.accroche}
            </p>

            {chiffres.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {chiffres.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-semibold"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white"
              >
                <Link href={boutonPrincipal.href}>{boutonPrincipal.libelle}</Link>
              </Button>
              {whatsapp && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Biens */}
      <section id="biens" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <EnTeteBiens
            titre={page.biens.titre}
            nombre={correspondants.length}
            lien={page.catalogue}
          />
          {principaux.length > 0 ? (
            <PropertySection biens={principaux} />
          ) : (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-[#FAF5EE] p-8 text-center text-neutral-600">
              {page.biens.texteVide}
            </p>
          )}

          {page.biensSecondaires && secondaires.length > 0 && (
            <div className="mt-20">
              <EnTeteBiens titre={page.biensSecondaires.titre} />
              <p className="-mt-6 mb-10 max-w-2xl text-neutral-600">
                {page.biensSecondaires.texte}
              </p>
              <PropertySection biens={secondaires} />
            </div>
          )}

          {repli.length > 0 && (
            <div className="mt-20">
              <EnTeteBiens titre="Nos autres logements meublés à Abidjan" />
              <PropertySection biens={repli} />
            </div>
          )}
        </div>
      </section>

      {/* Contenu */}
      {page.sections.map((section, i) => (
        <BlocSection
          key={section.titre}
          section={section}
          stats={stats}
          fondClair={i % 2 === 0}
        />
      ))}

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="font-agate text-3xl sm:text-4xl font-bold text-secondary mb-8">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {faq.map((f) => (
              <details key={f.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-secondary [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed text-neutral-600">{f.reponse}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="bg-secondary py-16 sm:py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="font-agate text-3xl sm:text-5xl font-bold">{page.cta.titre}</h2>
          <p className="mt-5 text-lg text-white/85">{page.cta.texte}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              <Link href={page.cta.bouton.href}>{page.cta.bouton.libelle}</Link>
            </Button>
            {whatsapp && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Écrire sur WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Maillage interne */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
            Voir aussi
          </h2>
          <ul className="flex flex-wrap gap-2">
            {[
              ...autresPages.map((p) => ({ libelle: p.lienCourt, href: `/${p.slug}` })),
              ...page.voirAussi,
            ].map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  {lien.libelle}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function EnTeteBiens({
  titre,
  nombre,
  lien,
}: {
  titre: string;
  nombre?: number;
  lien?: { libelle: string; href: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-agate text-3xl sm:text-4xl font-bold text-secondary">
          {titre}
        </h2>
        {nombre != null && nombre > 0 && (
          <p className="mt-2 text-sm text-neutral-500">
            {nombre} logement{nombre > 1 ? "s" : ""} disponible
            {nombre > 1 ? "s" : ""} en ligne
          </p>
        )}
      </div>
      {lien && (
        <Link
          href={lien.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {lien.libelle}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function BlocSection({
  section,
  stats,
  fondClair,
}: {
  section: SectionSeo;
  stats: StatsBiens;
  fondClair: boolean;
}) {
  const points = section.points ?? [];
  // Des étapes se suivent : liste numérotée. Sinon, simple liste.
  const Liste = section.etapes ? "ol" : "ul";
  return (
    <section className={cn("py-16 sm:py-20", fondClair ? "bg-[#FAF5EE]" : "bg-white")}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="font-agate text-3xl sm:text-4xl font-bold text-secondary mb-8 max-w-3xl">
          {section.titre}
        </h2>

        {section.paragraphes && (
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-neutral-700">
            {section.paragraphes.map((p, i) => (
              <p key={i}>{resoudre(p, stats)}</p>
            ))}
          </div>
        )}

        {points.length > 0 && (
          <Liste
            className={cn(
              "grid gap-6",
              points.length === 4
                ? "md:grid-cols-2 lg:grid-cols-4"
                : "md:grid-cols-2 lg:grid-cols-3",
              section.paragraphes && "mt-10",
            )}
          >
            {points.map((point, i) => (
              <li
                key={point.titre}
                className={cn(
                  "rounded-3xl border border-stone-100 p-7 shadow-sm",
                  fondClair ? "bg-white" : "bg-[#FAF5EE]",
                )}
              >
                {section.etapes && (
                  <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                )}
                <h3 className="text-lg font-bold text-secondary mb-2">{point.titre}</h3>
                <p className="leading-relaxed text-neutral-600">{point.texte}</p>
              </li>
            ))}
          </Liste>
        )}
      </div>
    </section>
  );
}
