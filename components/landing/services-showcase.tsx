import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HardHat,
  Home,
  BedDouble,
  Building2,
  Palette,
} from "lucide-react";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";
import { cn } from "@/lib/utils";

/**
 * "Nos métiers" — grille BENTO des GRANDS SERVICES de l'agence.
 *
 * Chaque carte :
 *   - Clic principal (toute la carte) → page du service /services/{slug}
 *   - Pastille secondaire → listings de biens filtrés (/properties?service=…)
 *     OU demande de devis pour les services sans listing (construction, déco)
 *
 * HTML valide : le lien "cover" (service) et la pastille (listings) sont
 * frères (jamais imbriqués), gérés par z-index.
 *
 * ⚠️ Images PLACEHOLDER (photos de biens existantes) à remplacer.
 * ⚠️ Le service "construction" doit exister dans /admin/services (slug
 *    `construction`) sinon /services/construction renvoie 404.
 */

type Bento = {
  slug: string;
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc?: string;
  badge?: string;
  span: string;
  /** Lien secondaire : listings filtrés OU devis. */
  secondary: { label: string; href: string };
};

const CARDS: Bento[] = [
  {
    slug: "construction",
    img: "/images/others/3d-electric-car-building.jpg", // PLACEHOLDER → chantier
    icon: HardHat,
    label: "Construction",
    desc: "De la conception à la livraison, clés en main.",
    span: "col-span-2 row-span-2",
    secondary: { label: "Demander un devis", href: "/contact_us" },
  },
  {
    slug: "location-meublee",
    img: "/images/biens/bien21.jpg", // PLACEHOLDER → appartement meublé
    icon: BedDouble,
    label: "Appartements meublés",
    desc: "Séjours haut de gamme, vue mer. Aussi sur Airbnb.",
    badge: "Airbnb · 24/7",
    span: "col-span-2 row-span-2",
    secondary: {
      label: "Voir les biens",
      href: "/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e",
    },
  },
  {
    slug: "vente",
    img: "/images/biens/bien15.jpg", // PLACEHOLDER → vente
    icon: Home,
    label: "Vente",
    span: "col-span-1 row-span-1",
    secondary: { label: "Voir les biens", href: "/properties?service=Vente" },
  },
  {
    slug: "gestion-immobiliere",
    img: "/images/biens/bien3.jpg", // PLACEHOLDER → gestion
    icon: Building2,
    label: "Gestion locative",
    span: "col-span-1 row-span-1",
    secondary: {
      label: "Voir les biens",
      href: "/properties?service=Gestion%20locative",
    },
  },
  {
    slug: "decoration-amenagement",
    img: "/images/biens/bien6.jpg", // PLACEHOLDER → décoration
    icon: Palette,
    label: "Décoration & aménagement",
    desc: "Donnez une nouvelle vie à vos espaces.",
    span: "col-span-2 row-span-1",
    secondary: { label: "Demander un devis", href: "/contact_us" },
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

        {/* Grille bento (entrée en cascade) */}
        <MotionStagger className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:gap-4 lg:grid-cols-4">
          {CARDS.map((c) => (
            <MotionStaggerChild key={c.slug} className={c.span}>
              <BentoCard card={c} />
            </MotionStaggerChild>
          ))}
        </MotionStagger>
      </div>
    </MotionSection>
  );
}

function BentoCard({ card }: { card: Bento }) {
  const { icon: Icon } = card;
  const isBig = card.span.includes("row-span-2");
  return (
    <div className="group relative h-full w-full overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:ring-primary/40">
      <Image
        src={card.img}
        alt={`${card.label} (image à remplacer)`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-colors duration-500 group-hover:from-black/90" />

      {/* Lien "cover" : toute la carte → page du service */}
      <Link
        href={`/services/${card.slug}`}
        aria-label={`${card.label} — découvrir le service`}
        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      />

      {/* Badge (ex. Airbnb) */}
      {card.badge && (
        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF385C]" />
          {card.badge}
        </div>
      )}

      {/* Pastille secondaire (au-dessus du cover) : listings / devis */}
      <Link
        href={card.secondary.href}
        className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition-colors hover:bg-primary hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {card.secondary.label}
        <ArrowRight className="h-3 w-3" />
      </Link>

      {/* Contenu (décoratif, sous le cover) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 p-4 text-white transition-transform duration-300 group-hover:-translate-y-1 sm:p-5">
        <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur transition-colors group-hover:bg-primary group-hover:text-secondary">
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
          <p className="mt-1 line-clamp-2 max-w-xs text-xs text-white/80 sm:text-sm">
            {card.desc}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <span className="h-0.5 w-8 rounded-full bg-primary transition-all duration-300 group-hover:w-14" />
          Découvrir le service
        </span>
      </div>
    </div>
  );
}
