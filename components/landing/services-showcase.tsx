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
 * Séquence "grands services" — direction éditoriale premium (immobilier luxe) :
 * Exaggerated Minimalism + Swiss editorial.
 *
 *   - Numéro éditorial surdimensionné (serif Agate, ghost orange)
 *   - Titres serif larges, tracking serré, mot-accent en italique orange
 *   - Grands blancs (py-24/32), imagerie cadrée rounded-[2rem] + zoom au hover
 *   - Accent orange unique et parcimonieux ; hairlines, captions discrètes
 *
 *   01. Construction · 02. Vente · 03. Gestion locative · 04. Appartements meublés
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

// ─── Eléments éditoriaux partagés ──────────────────────────────────────────
function Index({ n }: { n: string }) {
  return (
    <span
      aria-hidden="true"
      className="block font-agate text-6xl font-bold leading-none text-primary/20 sm:text-7xl"
    >
      {n}
    </span>
  );
}

function Eyebrow({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
      <span className="h-px w-8 bg-primary/50" />
      {label}
    </span>
  );
}

// Titre éditorial : serif large, tracking serré
const TITLE =
  "font-agate font-bold leading-[1.02] tracking-tight text-secondary text-4xl sm:text-5xl lg:text-[3.75rem]";

// ─── 01. Construction ──────────────────────────────────────────────────────
function ConstructionSection() {
  return (
    <MotionSection as="section" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Texte */}
          <div className="lg:order-1">
            <Index n="01" />
            <div className="mt-3">
              <Eyebrow label="Construction" />
            </div>
            <h2 className={cn(TITLE, "mt-5")}>
              De la conception
              <br />
              <span className="italic text-primary">à la livraison</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-600">
              Études, gros œuvre, finitions, livraison clés en main : nos équipes
              pilotent votre projet de A à Z, dans le respect des délais et du
              budget.
            </p>
            <Link
              href="/services/construction"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"
            >
              <span className="border-b-2 border-primary pb-1 transition-colors group-hover:text-primary">
                Découvrir le service
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Image chantier */}
          <div className="relative lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[4/3] lg:aspect-[4/5]">
              <Image
                src="/images/others/3d-electric-car-building.jpg" // PLACEHOLDER → photo chantier
                alt="Chantier de construction (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
            {/* Caption flottante */}
            <div className="absolute -bottom-5 left-5 rounded-2xl border border-stone-100 bg-white/95 px-5 py-3 shadow-xl backdrop-blur sm:-left-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Clés en main
              </p>
              <p className="mt-0.5 font-agate text-lg font-bold text-secondary">
                Délais maîtrisés
              </p>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

// ─── 02. Vente de biens immobiliers (Maison | Terrain) ─────────────────────
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Index n="02" />
            <div className="mt-3">
              <Eyebrow label="Vente" />
            </div>
            <h2 className={cn(TITLE, "mt-5 max-w-xl text-balance")}>
              Vente de biens immobiliers
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-neutral-600">
            Maison ou terrain : nous vous accompagnons de la recherche jusqu&apos;à
            la signature chez le notaire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                href={c.href}
                className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:aspect-[3/4] lg:aspect-[4/5]"
              >
                <Image
                  src={c.img}
                  alt={`${c.label} (image à remplacer)`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-agate text-3xl font-bold leading-tight text-white sm:text-4xl">
                    {c.label}
                  </h3>
                  <p className="mt-1.5 text-sm text-white/75">{c.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <span className="h-px w-6 bg-primary transition-all duration-300 group-hover:w-10" />
                    Voir les {c.label.toLowerCase()}s
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}

// ─── 03. Gestion locative ──────────────────────────────────────────────────
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
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl lg:aspect-[5/6]">
              <Image
                src="/images/biens/bien3.jpg" // PLACEHOLDER → visuel gestion locative
                alt="Gestion locative (image à remplacer)"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
          </div>

          {/* Texte */}
          <div>
            <Index n="03" />
            <div className="mt-3">
              <Eyebrow label="Gestion locative" />
            </div>
            <h2 className={cn(TITLE, "mt-5")}>
              Vos biens entre
              <br />
              <span className="italic text-primary">de bonnes mains</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
              Nous prenons en charge tout le cycle locatif pour que vous
              perceviez vos revenus sans aucune contrainte.
            </p>

            <MotionStagger className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {points.map((p) => {
                const Icon = p.icon;
                return (
                  <MotionStaggerChild key={p.t}>
                    <div className="border-l-2 border-primary/30 pl-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="mt-2 text-base font-semibold text-secondary">
                        {p.t}
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-neutral-600">
                        {p.d}
                      </div>
                    </div>
                  </MotionStaggerChild>
                );
              })}
            </MotionStagger>

            <Link
              href="/services/gestion-immobiliere"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"
            >
              <span className="border-b-2 border-primary pb-1 transition-colors group-hover:text-primary">
                En savoir plus
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

// ─── 04. Appartements meublés (galerie éditoriale + Airbnb) ────────────────
function AppartementsMeublesSection() {
  // Galerie asymétrique : 1 grand visuel (balcon vue mer) + 3 plus petits.
  const feature = { label: "Balcon vue mer", img: "/images/biens/bien21.jpg", icon: Wind };
  const small = [
    { label: "Chambre", img: "/images/biens/bien1.jpg", icon: BedDouble },
    { label: "Salon", img: "/images/biens/bien6.jpg", icon: Sofa },
    { label: "Salle d'eau", img: "/images/biens/bien10.jpg", icon: Bath },
  ];

  return (
    <MotionSection as="section" className="bg-primary/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          {/* Texte */}
          <div>
            <Index n="04" />
            <div className="mt-3">
              <Eyebrow label="Appartements meublés" />
            </div>
            <h2 className={cn(TITLE, "mt-5")}>
              Spécialistes de l&apos;
              <span className="italic text-primary">art de recevoir</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
              Logements neufs clé en main, balcons avec belle vue en bordure de
              mer : un séjour haut de gamme à Abidjan. Ménage, wifi haut débit et
              parking sécurisé inclus.
            </p>

            {/* Mention Airbnb */}
            <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm text-neutral-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#FF385C]" />
              Aussi sur <strong className="text-secondary">Airbnb</strong>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500">réservation 24/7</span>
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
                  "h-12 px-7 text-base",
                )}
              >
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Galerie asymétrique */}
          <MotionStagger className="grid grid-cols-2 gap-3 sm:gap-4">
            <MotionStaggerChild className="col-span-2">
              <GalleryTile {...feature} ratio="aspect-[16/10]" />
            </MotionStaggerChild>
            {small.map((g) => (
              <MotionStaggerChild key={g.label}>
                <GalleryTile {...g} ratio="aspect-square" />
              </MotionStaggerChild>
            ))}
          </MotionStagger>
        </div>
      </div>
    </MotionSection>
  );
}

function GalleryTile({
  label,
  img,
  icon: Icon,
  ratio,
}: {
  label: string;
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  ratio: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl shadow-md",
        ratio,
      )}
    >
      <Image
        src={img}
        alt={`${label} (image à remplacer)`}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4 text-white">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
