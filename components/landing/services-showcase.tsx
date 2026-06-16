import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  HardHat,
  Home,
  BedDouble,
  Building2,
} from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { MotionSection } from "./motion-section";

/**
 * "Nos métiers" — 4 grands services en RANGÉES ALTERNÉES compactes
 * (image gauche / infos droite, puis inversé). Chaque rangée tient sur une
 * hauteur raisonnable (image 4/3), pas plein écran.
 *
 * Chaque service :
 *   - Image + bouton "Découvrir le service" → /services/{slug}
 *   - Bouton secondaire → listings filtrés (/properties?service=…) ou devis
 *
 * ⚠️ Images PLACEHOLDER (photos de biens existantes) à remplacer.
 */

type Service = {
  slug: string;
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  tags: string[];
  badge?: string;
  secondary: { label: string; href: string };
};

const SERVICES: Service[] = [
  {
    slug: "construction",
    img: "/images/others/3d-electric-car-building.jpg", // PLACEHOLDER → chantier
    icon: HardHat,
    label: "Construction",
    desc: "Nous bâtissons votre projet de A à Z : études, gros œuvre, finitions et livraison clés en main, délais et budget maîtrisés.",
    tags: ["Études", "Gros œuvre", "Clés en main"],
    secondary: { label: "Demander un devis", href: "/contact_us" },
  },
  {
    slug: "location-meublee",
    img: "/images/biens/bien21.jpg", // PLACEHOLDER → appartement meublé
    icon: BedDouble,
    label: "Appartements meublés",
    desc: "Logements neufs clé en main, balcons avec belle vue en bordure de mer : un séjour haut de gamme à Abidjan.",
    tags: ["Vue mer", "Tout équipé", "Airbnb 24/7"],
    badge: "Airbnb",
    secondary: {
      label: "Voir les biens",
      href: "/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e",
    },
  },
  {
    slug: "vente",
    img: "/images/biens/bien15.jpg", // PLACEHOLDER → vente
    icon: Home,
    label: "Vente de biens",
    desc: "Vendez votre bien avec un partenaire de confiance : estimation, mise en valeur, diffusion et accompagnement jusqu'à la signature.",
    tags: ["Estimation", "Mandat sérieux", "Notaire"],
    secondary: { label: "Voir les biens", href: "/properties?service=Vente" },
  },
  {
    slug: "gestion-immobiliere",
    img: "/images/biens/bien3.jpg", // PLACEHOLDER → gestion
    icon: Building2,
    label: "Gestion locative",
    desc: "Nous prenons en charge tout le cycle locatif pour que vous perceviez vos revenus sans aucune contrainte.",
    tags: ["Locataires vérifiés", "Loyers à date fixe", "Suivi technique"],
    secondary: {
      label: "Voir les biens",
      href: "/properties?service=Gestion%20locative",
    },
  },
];

export default function ServicesShowcase() {
  return (
    <section className="bg-[#FAF5EE] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* En-tête compact */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
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

        {/* Rangées alternées */}
        <div className="space-y-12 sm:space-y-16">
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.slug} service={s} index={i + 1} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({
  service,
  index,
  reversed,
}: {
  service: Service;
  index: number;
  reversed: boolean;
}) {
  const { icon: Icon } = service;
  return (
    <MotionSection
      as="div"
      className="grid grid-cols-1 items-center gap-7 lg:grid-cols-2 lg:gap-14"
    >
      {/* Image (→ page service) */}
      <Link
        href={`/services/${service.slug}`}
        aria-label={`${service.label} — découvrir le service`}
        className={cn(
          "group relative block overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:ring-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          reversed && "lg:order-2",
        )}
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={service.img}
            alt={`${service.label} (image à remplacer)`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {service.badge && (
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF385C]" />
              {service.badge}
            </div>
          )}
          {/* Pastille icône en coin */}
          <div className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-primary shadow-md backdrop-blur transition-colors group-hover:bg-primary group-hover:text-secondary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Link>

      {/* Infos */}
      <div className={cn(reversed && "lg:order-1")}>
        <div className="flex items-baseline gap-4">
          <span className="font-agate text-4xl font-bold leading-none text-primary/25 sm:text-5xl">
            0{index}
          </span>
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-6 bg-primary/50" />
            Service
          </span>
        </div>

        <h3 className="mt-4 font-agate text-2xl font-bold leading-tight tracking-tight text-secondary sm:text-3xl lg:text-4xl">
          {service.label}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-600">
          {service.desc}
        </p>

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {service.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={`/services/${service.slug}`}
            className={cn(buttonVariants(), "h-11 gap-2 px-5 text-sm")}
          >
            Découvrir le service
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href={service.secondary.href}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 gap-2 border-stone-300 px-5 text-sm text-secondary hover:border-primary/40 hover:text-primary",
            )}
          >
            {service.secondary.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
