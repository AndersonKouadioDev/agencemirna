import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Wind,
  Sofa,
  ShieldCheck,
  Wallet,
  Wrench,
  FileBarChart,
} from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Séquence "grands services" — chaque service a une COMPOSITION DISTINCTE
 * (pas d'alternance image/texte répétitive) pour un rendu éditorial premium :
 *
 *   01. Construction         → carte texte chevauchant l'image + n° filigrane
 *   02. Vente                → diptyque plein cadre Maison | Terrain
 *   03. Gestion locative     → composition menée par le texte (liste à filets)
 *   04. Appartements meublés → section sombre immersive + mosaïque bento
 *
 * ⚠️ Images PLACEHOLDER (photos de biens existantes) à remplacer :
 *   chantier · maison · terrain · gestion · chambre · salle d'eau · balcon · salon
 */
export default function ServicesShowcase() {
  return (
    <div className="overflow-x-clip">
      <ConstructionSection />
      <VenteSection />
      <GestionLocativeSection />
      <AppartementsMeublesSection />
    </div>
  );
}

// ─── Éléments éditoriaux partagés ──────────────────────────────────────────
function Eyebrow({
  num,
  label,
  onDark = false,
}: {
  num: string;
  label: string;
  onDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-agate text-2xl font-bold text-primary">{num}</span>
      <span className="h-px w-8 bg-primary/50" />
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em]",
          onDark ? "text-white/70" : "text-neutral-500",
        )}
      >
        {label}
      </span>
    </div>
  );
}

const TITLE =
  "font-agate font-bold leading-[1.02] tracking-tight text-4xl sm:text-5xl lg:text-[3.5rem]";

// ─── 01. Construction — carte texte chevauchant l'image ────────────────────
function ConstructionSection() {
  return (
    <MotionSection as="section" className="relative bg-white py-24 sm:py-32">
      {/* Numéro géant en filigrane */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-10 select-none font-agate text-[10rem] font-bold leading-none text-primary/[0.06] sm:text-[16rem] lg:right-16"
      >
        01
      </span>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center lg:grid-cols-12">
          {/* Image */}
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-2xl">
              <Image
                src="/images/others/3d-electric-car-building.jpg" // PLACEHOLDER → photo chantier
                alt="Chantier de construction (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
          </div>

          {/* Carte texte qui chevauche l'image (desktop) */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:z-10">
            <div className="-mt-10 rounded-[2rem] border border-stone-100 bg-white p-8 shadow-2xl sm:p-10 lg:mt-0 lg:p-12">
              <Eyebrow num="01" label="Construction" />
              <h2 className={cn(TITLE, "mt-6 text-secondary")}>
                De la conception
                <br />
                <span className="italic text-primary">à la livraison</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-neutral-600">
                Études, gros œuvre, finitions, livraison clés en main : nos
                équipes pilotent votre projet de A à Z, délais et budget
                maîtrisés.
              </p>
              <Link
                href="/contact_us"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"
              >
                <span className="border-b-2 border-primary pb-1 transition-colors group-hover:text-primary">
                  Parler de mon projet
                </span>
                <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

// ─── 02. Vente — diptyque plein cadre Maison | Terrain ─────────────────────
function VenteSection() {
  const cards = [
    {
      label: "Maison",
      desc: "Villas, duplex, résidences.",
      img: "/images/biens/bien15.jpg", // PLACEHOLDER → photo maison
      href: "/properties?type=Maison",
      icon: Home,
    },
    {
      label: "Terrain",
      desc: "Parcelles viabilisées & terrains à bâtir.",
      img: "/images/biens/bien7.jpg", // PLACEHOLDER → photo terrain
      href: "/properties?type=Terrain",
      icon: MapPin,
    },
  ];

  return (
    <MotionSection as="section" className="bg-primary/5 py-24 sm:py-32">
      {/* En-tête */}
      <div className="mx-auto mb-12 max-w-7xl px-6 text-center lg:px-8">
        <div className="flex justify-center">
          <Eyebrow num="02" label="Vente de biens immobiliers" />
        </div>
        <h2 className={cn(TITLE, "mx-auto mt-5 max-w-2xl text-balance text-secondary")}>
          Maison <span className="text-primary/30">ou</span> terrain
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-neutral-600">
          De la recherche jusqu&apos;à la signature chez le notaire.
        </p>
      </div>

      {/* Diptyque bord à bord (pleine largeur) */}
      <div className="grid grid-cols-1 gap-px bg-primary/20 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group relative aspect-[4/3] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:aspect-[3/4] lg:aspect-[16/12]"
            >
              <Image
                src={c.img}
                alt={`${c.label} (image à remplacer)`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-colors duration-500 group-hover:from-black/90" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 lg:p-14">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-agate text-4xl font-bold leading-tight text-white sm:text-5xl">
                  {c.label}
                </h3>
                <p className="mt-2 text-sm text-white/75">{c.desc}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <span className="h-px w-6 bg-primary transition-all duration-300 group-hover:w-12" />
                  Explorer
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </MotionSection>
  );
}

// ─── 03. Gestion locative — composition menée par le texte ─────────────────
function GestionLocativeSection() {
  const points = [
    { icon: ShieldCheck, t: "Locataires sélectionnés", d: "Dossiers vérifiés, solvabilité contrôlée." },
    { icon: Wallet, t: "Loyers encaissés", d: "Reversés à date fixe, sans retard." },
    { icon: Wrench, t: "Suivi technique", d: "Maintenance et artisans coordonnés." },
    { icon: FileBarChart, t: "Reporting clair", d: "Vos revenus suivis en transparence." },
  ];

  return (
    <MotionSection as="section" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* En-tête éditorial pleine largeur */}
        <div className="grid grid-cols-1 gap-6 border-b border-stone-200 pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Eyebrow num="03" label="Gestion locative" />
            <h2 className={cn(TITLE, "mt-6 max-w-2xl text-secondary")}>
              Vos biens entre{" "}
              <span className="italic text-primary">de bonnes mains</span>
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-neutral-600 lg:col-span-4">
            Tout le cycle locatif pris en charge — vous percevez vos revenus
            sans aucune contrainte.
          </p>
        </div>

        {/* Rangée : liste de points (3/5) + image d'appui (2/5) */}
        <div className="grid grid-cols-1 gap-10 pt-12 lg:grid-cols-12 lg:gap-12">
          <MotionStagger className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7">
            {points.map((p, i) => {
              const Icon = p.icon;
              return (
                <MotionStaggerChild key={p.t}>
                  <div className="flex gap-4">
                    <span className="font-agate text-xl font-bold text-primary/40 tabular-nums">
                      0{i + 1}
                    </span>
                    <div className="border-t border-stone-200 pt-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="mt-2 text-base font-semibold text-secondary">
                        {p.t}
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-neutral-600">
                        {p.d}
                      </div>
                    </div>
                  </div>
                </MotionStaggerChild>
              );
            })}
          </MotionStagger>

          {/* Image d'appui */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl lg:h-full">
              <Image
                src="/images/biens/bien3.jpg" // PLACEHOLDER → visuel gestion locative
                alt="Gestion locative (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
          </div>
        </div>

        <Link
          href="/services/gestion-immobiliere"
          className="group mt-12 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"
        >
          <span className="border-b-2 border-primary pb-1 transition-colors group-hover:text-primary">
            En savoir plus
          </span>
          <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </MotionSection>
  );
}

// ─── 04. Appartements meublés — section sombre immersive + bento ───────────
function AppartementsMeublesSection() {
  const feature = { label: "Balcon vue mer", img: "/images/biens/bien21.jpg", icon: Wind };
  const small = [
    { label: "Chambre", img: "/images/biens/bien1.jpg", icon: BedDouble },
    { label: "Salon", img: "/images/biens/bien6.jpg", icon: Sofa },
    { label: "Salle d'eau", img: "/images/biens/bien10.jpg", icon: Bath },
  ];

  return (
    <MotionSection
      as="section"
      className="relative isolate overflow-hidden bg-secondary py-24 text-white sm:py-32"
    >
      {/* Halo chaud décoratif */}
      <div
        aria-hidden="true"
        className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Texte */}
          <div>
            <Eyebrow num="04" label="Appartements meublés" onDark />
            <h2 className={cn(TITLE, "mt-6 text-white")}>
              L&apos;art de{" "}
              <span className="italic text-primary">recevoir</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              Logements neufs clé en main, balcons avec belle vue en bordure de
              mer : un séjour haut de gamme à Abidjan. Ménage, wifi haut débit
              et parking sécurisé inclus.
            </p>

            {/* Mention Airbnb */}
            <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#FF385C]" />
              Aussi sur <strong className="text-white">Airbnb</strong>
              <span className="text-white/30">·</span>
              <span className="text-white/50">réservation 24/7</span>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e"
                className={cn(buttonVariants(), "h-12 px-7 text-base")}
              >
                Réserver un meublé
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact_us"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 border-white/40 bg-white/5 px-7 text-base text-white hover:bg-white hover:text-secondary",
                )}
              >
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Mosaïque bento */}
          <MotionStagger className="grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4">
            <MotionStaggerChild className="col-span-2 row-span-2">
              <BentoTile {...feature} className="h-full min-h-[16rem]" />
            </MotionStaggerChild>
            <MotionStaggerChild>
              <BentoTile {...small[0]} className="aspect-square" />
            </MotionStaggerChild>
            <MotionStaggerChild>
              <BentoTile {...small[1]} className="aspect-square" />
            </MotionStaggerChild>
            <MotionStaggerChild className="col-span-3">
              <BentoTile {...small[2]} className="aspect-[16/7]" />
            </MotionStaggerChild>
          </MotionStagger>
        </div>
      </div>
    </MotionSection>
  );
}

function BentoTile({
  label,
  img,
  icon: Icon,
  className,
}: {
  label: string;
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl ring-1 ring-white/10",
        className,
      )}
    >
      <Image
        src={img}
        alt={`${label} (image à remplacer)`}
        fill
        sizes="(max-width: 768px) 50vw, 30vw"
        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3.5 text-white">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
