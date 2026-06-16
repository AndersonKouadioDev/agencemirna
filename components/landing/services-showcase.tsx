import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  HardHat,
  Home,
  BedDouble,
  Building2,
  Check,
} from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { MotionSection } from "./motion-section";

/**
 * "Nos métiers" — section éditoriale élégante : une BANDE par service,
 * chacune avec son fond, ses motifs décoratifs (trames, anneaux, points
 * flottants — SVG animés en motion-safe) et une composition d'images
 * différente (1, 2 ou 3 images).
 *
 *   01. Construction        → 1 image + caption (fond blanc, trame plan + anneau)
 *   02. Appartements meublés→ 3 images (fond cream, trame pointillés)
 *   03. Vente               → 2 images chevauchées (fond tinté, points flottants)
 *   04. Gestion locative    → 1 image + carte info (fond blanc, blob)
 *
 * ⚠️ Images PLACEHOLDER (photos de biens existantes) à remplacer.
 */

// ─── Motifs décoratifs (aria-hidden, animés en motion-safe) ────────────────
function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute text-primary/15", className)}
      style={{
        backgroundImage:
          "radial-gradient(currentColor 1.3px, transparent 1.3px)",
        backgroundSize: "18px 18px",
      }}
    />
  );
}

function LineGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute text-secondary/[0.05]", className)}
      style={{
        backgroundImage:
          "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

function Ring({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={cn(
        "pointer-events-none absolute text-primary/25 motion-safe:animate-[spin_40s_linear_infinite]",
        className,
      )}
    >
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 12"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FloatBlob({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl motion-safe:animate-float-slow",
        className,
      )}
    />
  );
}

// Arcs concentriques (motif coin) — flottement discret
function Arcs({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className={cn(
        "pointer-events-none absolute text-primary/25 motion-safe:animate-float",
        className,
      )}
    >
      <path d="M8 112 A104 104 0 0 1 112 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 80 A72 72 0 0 1 80 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 48 A40 40 0 0 1 48 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Carré arrondi pointillé qui tourne lentement
function SquareOutline({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn(
        "pointer-events-none absolute text-primary/25 motion-safe:animate-[spin_50s_linear_infinite]",
        className,
      )}
    >
      <rect
        x="14"
        y="14"
        width="72"
        height="72"
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 11"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Courbe ascendante qui se dessine (revenus) — visible si reduced-motion
function TrendLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 64"
      className={cn("pointer-events-none absolute text-primary/40", className)}
    >
      <path
        d="M4 54 L34 34 L60 42 L92 16 L116 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="motion-safe:[stroke-dasharray:1] motion-safe:[stroke-dashoffset:1] motion-safe:animate-draw"
      />
      <circle cx="116" cy="6" r="3.5" fill="currentColor" />
    </svg>
  );
}

// ─── En-tête ───────────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div className="mx-auto mb-4 max-w-6xl px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary/50" />
            Nos métiers
          </span>
          <h2 className="mt-3 max-w-xl font-agate text-3xl font-bold leading-[1.05] tracking-tight text-secondary sm:text-4xl">
            Tout votre projet immobilier,
            <span className="text-primary"> sous un même toit</span>
          </h2>
        </div>
        <Link
          href="/services"
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          Tous nos services
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Colonne texte (commune) ───────────────────────────────────────────────
function TextCol({
  index,
  icon: Icon,
  label,
  paragraphs,
  features,
  slug,
  secondary,
  className,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  paragraphs: string[];
  features: string[];
  slug: string;
  secondary: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-agate text-3xl font-bold text-primary/25">
          {index}
        </span>
      </div>

      <h3 className="mt-5 font-agate text-3xl font-bold leading-tight tracking-tight text-secondary sm:text-4xl">
        {label}
      </h3>

      <div className="mt-4 max-w-md space-y-3 text-[15px] leading-relaxed text-neutral-600">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-secondary">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-3 w-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          href={`/services/${slug}`}
          className={cn(buttonVariants(), "h-11 gap-2 px-5 text-sm")}
        >
          Découvrir le service
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href={secondary.href}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 gap-2 border-stone-300 px-5 text-sm text-secondary hover:border-primary/40 hover:text-primary",
          )}
        >
          {secondary.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

const GRID = "mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8";
const FRAME = "relative overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5";

export default function ServicesShowcase() {
  return (
    <div className="overflow-x-clip">
      {/* En-tête sur fond blanc (continu avec la bande Construction) */}
      <div className="bg-white pt-16 sm:pt-20">
        <SectionHeader />
      </div>

      {/* 01 — Construction (fond blanc, trame plan + anneau, 1 image) */}
      <MotionSection as="section" className="relative bg-white py-16 sm:py-20">
        <LineGrid className="inset-y-0 right-0 w-1/2" />
        <Ring className="-right-16 top-8 h-64 w-64" />
        <div className={GRID}>
          <div className="relative lg:order-2">
            <div className={cn(FRAME, "aspect-[4/3]")}>
              <Image
                src="/images/others/3d-electric-car-building.jpg" // PLACEHOLDER → chantier
                alt="Construction (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-5 left-5 rounded-2xl border border-stone-100 bg-white/95 px-5 py-3 shadow-xl backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Clés en main
              </p>
              <p className="mt-0.5 font-agate text-lg font-bold text-secondary">
                Délais maîtrisés
              </p>
            </div>
          </div>
          <TextCol
            className="lg:order-1"
            index="01"
            icon={HardHat}
            label="Construction"
            paragraphs={[
              "Nous concevons et bâtissons votre projet de A à Z : études techniques, gros œuvre, second œuvre et finitions.",
              "Livraison clés en main, dans le respect des délais et du budget convenus.",
            ]}
            features={["Études & plans", "Gros œuvre & finitions", "Livraison clés en main"]}
            slug="construction"
            secondary={{ label: "Demander un devis", href: "/contact_us" }}
          />
        </div>
      </MotionSection>

      {/* 02 — Appartements meublés (fond cream, pointillés, 3 images) */}
      <MotionSection
        as="section"
        className="relative bg-[#FAF5EE] py-16 sm:py-20"
      >
        <DotGrid className="left-0 top-0 h-40 w-1/3" />
        <Arcs className="right-4 top-6 h-24 w-24 lg:h-32 lg:w-32" />
        <div className={GRID}>
          <TextCol
            index="02"
            icon={BedDouble}
            label="Appartements meublés"
            paragraphs={[
              "Des logements neufs entièrement équipés, avec balcons offrant une belle vue en bordure de mer.",
              "Ménage, wifi haut débit et parking sécurisé inclus. Réservez aussi sur Airbnb, 24h/24.",
            ]}
            features={["Vue mer", "Clé en main", "Airbnb 24/7"]}
            slug="location-meublee"
            secondary={{
              label: "Voir les biens",
              href: "/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e",
            }}
          />
          {/* Trio d'images */}
          <div className="relative grid h-[22rem] grid-cols-2 gap-3 sm:h-[26rem] sm:gap-4">
            <div className={cn(FRAME, "h-full")}>
              <Image
                src="/images/biens/bien21.jpg" // PLACEHOLDER → balcon vue mer
                alt="Balcon vue mer (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF385C]" />
                Airbnb
              </div>
            </div>
            <div className="grid grid-rows-2 gap-3 sm:gap-4">
              <div className={cn(FRAME)}>
                <Image
                  src="/images/biens/bien1.jpg" // PLACEHOLDER → chambre
                  alt="Chambre (image à remplacer)"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
                />
              </div>
              <div className={cn(FRAME)}>
                <Image
                  src="/images/biens/bien6.jpg" // PLACEHOLDER → salon
                  alt="Salon (image à remplacer)"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* 03 — Vente (fond tinté, points flottants, 2 images chevauchées) */}
      <MotionSection
        as="section"
        className="relative overflow-hidden bg-primary/[0.04] py-16 sm:py-24"
      >
        <FloatBlob className="-left-10 top-10 h-72 w-72 bg-primary/10" />
        <SquareOutline className="-right-8 top-12 h-44 w-44" />
        <DotGrid className="bottom-6 left-6 h-24 w-32" />
        <div className={GRID}>
          <div className="relative lg:order-2 lg:pb-10 lg:pr-10">
            <div className={cn(FRAME, "aspect-[4/3]")}>
              <Image
                src="/images/biens/bien15.jpg" // PLACEHOLDER → vente (extérieur)
                alt="Vente (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
            {/* Image chevauchée */}
            <div
              className={cn(
                FRAME,
                "absolute -bottom-6 -left-6 aspect-square w-2/5 ring-4 ring-[#FAF5EE] sm:w-1/3",
              )}
            >
              <Image
                src="/images/biens/bien8.jpg" // PLACEHOLDER → vente (intérieur)
                alt="Vente intérieur (image à remplacer)"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>
          <TextCol
            className="lg:order-1"
            index="03"
            icon={Home}
            label="Vente de biens"
            paragraphs={[
              "Vendez votre bien avec un partenaire de confiance : estimation juste, mise en valeur professionnelle et diffusion auprès de notre réseau d'acheteurs.",
              "Nous vous accompagnons du mandat jusqu'à la signature chez le notaire.",
            ]}
            features={["Estimation gratuite", "Mandat sérieux", "Jusqu'au notaire"]}
            slug="vente"
            secondary={{ label: "Voir les biens", href: "/properties?service=Vente" }}
          />
        </div>
      </MotionSection>

      {/* 04 — Gestion locative (fond blanc, blob, 1 image + carte info) */}
      <MotionSection as="section" className="relative bg-white py-16 sm:py-20">
        <FloatBlob className="-right-10 bottom-0 h-72 w-72 bg-secondary/[0.06]" />
        <DotGrid className="left-6 top-8 h-28 w-36" />
        <TrendLine className="right-8 top-10 hidden h-16 w-32 lg:block" />
        <div className={GRID}>
          <div className="relative lg:order-1">
            <div className={cn(FRAME, "aspect-[4/3]")}>
              <Image
                src="/images/biens/bien3.jpg" // PLACEHOLDER → gestion
                alt="Gestion locative (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
            {/* Carte info flottante */}
            <div className="absolute -right-4 -top-4 hidden rounded-2xl border border-stone-100 bg-white px-5 py-4 shadow-xl sm:block">
              <p className="font-agate text-3xl font-bold leading-none text-secondary">
                0<span className="text-primary">%</span>
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                de souci pour vous
              </p>
            </div>
          </div>
          <TextCol
            className="lg:order-2"
            index="04"
            icon={Building2}
            label="Gestion locative"
            paragraphs={[
              "Confiez-nous la gestion complète de vos biens : sélection des locataires, encaissement des loyers, suivi technique et reporting.",
              "Vous percevez vos revenus, l'esprit totalement tranquille.",
            ]}
            features={["Locataires vérifiés", "Loyers à date fixe", "Suivi technique"]}
            slug="gestion-immobiliere"
            secondary={{
              label: "Voir les biens",
              href: "/properties?service=Gestion%20locative",
            }}
          />
        </div>
      </MotionSection>
    </div>
  );
}
