import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  HardHat,
  Home,
  MapPin,
  BedDouble,
  Building2,
} from "lucide-react";
import { MotionSection } from "./motion-section";
import { cn } from "@/lib/utils";

/**
 * "Nos métiers" — grille BENTO dense (style Apple) au lieu de grandes
 * sections vides : cartes de tailles variées, remplies, scannables.
 *
 *   ┌───────────────┬───────────────┐
 *   │ Construction  │  Meublés      │   (2 grandes cartes 2×2)
 *   │   (2×2)       │   (2×2)       │
 *   ├───────┬───────┼───────────────┤
 *   │ Maison│Terrain│ Gestion (2×1) │
 *   └───────┴───────┴───────────────┘
 *
 * ⚠️ Images PLACEHOLDER (photos de biens existantes) à remplacer :
 *   chantier · meublés · maison · terrain · gestion
 */

type Bento = {
  href: string;
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc?: string;
  badge?: string;
  span: string;
};

const CARDS: Bento[] = [
  {
    href: "/contact_us",
    img: "/images/others/3d-electric-car-building.jpg", // PLACEHOLDER → chantier
    icon: HardHat,
    label: "Construction",
    desc: "De la conception à la livraison, clés en main.",
    span: "col-span-2 row-span-2",
  },
  {
    href: "/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e",
    img: "/images/biens/bien21.jpg", // PLACEHOLDER → appartement meublé
    icon: BedDouble,
    label: "Appartements meublés",
    desc: "Séjours haut de gamme, vue mer. Aussi sur Airbnb.",
    badge: "Airbnb · 24/7",
    span: "col-span-2 row-span-2",
  },
  {
    href: "/properties?type=Maison",
    img: "/images/biens/bien15.jpg", // PLACEHOLDER → maison
    icon: Home,
    label: "Maison",
    span: "col-span-1 row-span-1",
  },
  {
    href: "/properties?type=Terrain",
    img: "/images/biens/bien7.jpg", // PLACEHOLDER → terrain
    icon: MapPin,
    label: "Terrain",
    span: "col-span-1 row-span-1",
  },
  {
    href: "/services/gestion-immobiliere",
    img: "/images/biens/bien3.jpg", // PLACEHOLDER → gestion locative
    icon: Building2,
    label: "Gestion locative",
    desc: "Loyers à date fixe, zéro souci.",
    span: "col-span-2 row-span-1",
  },
];

export default function ServicesShowcase() {
  return (
    <MotionSection as="section" className="bg-[#FAF5EE] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* En-tête compact */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="h-px w-8 bg-primary/50" />
              Nos métiers
            </span>
            <h2 className="mt-3 max-w-xl font-agate text-3xl font-bold leading-[1.05] tracking-tight text-secondary sm:text-4xl lg:text-5xl">
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

        {/* Grille bento */}
        <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:gap-4 lg:grid-cols-4">
          {CARDS.map((c) => (
            <BentoCard key={c.label} card={c} />
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function BentoCard({ card }: { card: Bento }) {
  const { icon: Icon } = card;
  const isBig = card.span.includes("row-span-2");
  return (
    <Link
      href={card.href}
      className={cn(
        "group relative overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        card.span,
      )}
    >
      <Image
        src={card.img}
        alt={`${card.label} (image à remplacer)`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {card.badge && (
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF385C]" />
          {card.badge}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
        <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Icon className="h-5 w-5" />
        </div>
        <h3
          className={cn(
            "font-agate font-bold leading-tight text-white",
            isBig ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
          )}
        >
          {card.label}
        </h3>
        {card.desc && (
          <p className="mt-1 line-clamp-2 max-w-xs text-xs text-white/75 sm:text-sm">
            {card.desc}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Découvrir
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
