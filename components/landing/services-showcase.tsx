import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
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
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Séquence "grands services" de la home : chaque grand service de l'agence a
 * sa propre section vitrine, qui se suivent de haut en bas.
 *
 *   01. Construction
 *   02. Vente de biens immobiliers (Maison | Terrain)
 *   03. Gestion locative
 *   04. Appartements meublés (galerie + mention Airbnb)
 *
 * Fonds alternés (blanc / cream) en démarrant sur blanc.
 *
 * ⚠️ IMAGES PLACEHOLDER : toutes les images ci-dessous sont des photos de
 * biens existantes utilisées en attendant les vrais visuels. À remplacer :
 *   - Construction : la photo de chantier
 *   - Vente : photo maison + photo terrain
 *   - Gestion locative : photo d'illustration
 *   - Appartements meublés : chambre, salle d'eau, balcon, salon
 */
export default function ServicesShowcase() {
  return (
    <>
      <ConstructionSection />
      <VenteSection />
      <GestionLocativeSection />
      <AppartementsMeublesSection />
    </>
  );
}

// ─── Eyebrow commun "0X · Nom" ─────────────────────────────────────────────
function Eyebrow({ num, label }: { num: string; label: string }) {
  return (
    <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
      <span className="tabular-nums">{num}</span>
      <span className="h-px w-6 bg-primary/40" />
      {label}
    </p>
  );
}

// ─── 01. Construction ──────────────────────────────────────────────────────
function ConstructionSection() {
  return (
    <MotionSection as="section" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Texte */}
          <div className="lg:order-1">
            <Eyebrow num="01" label="Construction" />
            <h2 className="font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
              De la conception{" "}
              <span className="italic text-primary">à la livraison</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700">
              Nos équipes pilotent votre projet de construction de A à Z :
              études, gros œuvre, finitions et livraison clés en main, dans le
              respect des délais et du budget.
            </p>

            <div className="mt-9">
              <Link
                href="/services/construction"
                className={cn(buttonVariants(), "h-12 px-6 text-base")}
              >
                Découvrir le service
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Image chantier */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl lg:order-2">
            <Image
              src="/images/others/3d-electric-car-building.jpg" // PLACEHOLDER → photo chantier
              alt="Chantier de construction (image à remplacer)"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
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
      desc: "Villas, duplex, résidences : votre futur chez-vous.",
      img: "/images/biens/bien15.jpg", // PLACEHOLDER → photo maison
      href: "/properties?type=Maison",
      icon: Home,
    },
    {
      label: "Terrain",
      desc: "Parcelles viabilisées et terrains à bâtir.",
      img: "/images/biens/bien7.jpg", // PLACEHOLDER → photo terrain
      href: "/properties?type=Terrain",
      icon: MapPin,
    },
  ];

  return (
    <MotionSection as="section" className="bg-primary/5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Eyebrow num="02" label="Vente" />
          <h2 className="font-agate text-3xl font-bold leading-tight text-secondary text-balance sm:text-4xl md:text-5xl">
            Vente de biens immobiliers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            Maison ou terrain, nous vous accompagnons de la recherche jusqu&apos;à
            la signature chez le notaire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-8">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                href={c.href}
                className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl"
              >
                <Image
                  src={c.img}
                  alt={`${c.label} (image à remplacer)`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-agate text-2xl font-bold text-white sm:text-3xl">
                    {c.label}
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-white/80">{c.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
                    Voir les {c.label.toLowerCase()}s
                    <ArrowRight className="h-4 w-4" />
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
    <MotionSection as="section" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="/images/biens/bien3.jpg" // PLACEHOLDER → visuel gestion locative
              alt="Gestion locative (image à remplacer)"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Texte */}
          <div>
            <Eyebrow num="03" label="Gestion locative" />
            <h2 className="font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
              Vos biens entre{" "}
              <span className="italic text-primary">de bonnes mains</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700">
              Nous prenons en charge tout le cycle locatif pour que vous
              perceviez vos revenus sans aucune contrainte.
            </p>

            <MotionStagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {points.map((p) => {
                const Icon = p.icon;
                return (
                  <MotionStaggerChild key={p.t}>
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-secondary">
                          {p.t}
                        </div>
                        <div className="text-xs text-neutral-600">{p.d}</div>
                      </div>
                    </div>
                  </MotionStaggerChild>
                );
              })}
            </MotionStagger>

            <div className="mt-9">
              <Link
                href="/services/gestion-immobiliere"
                className={cn(buttonVariants(), "h-12 px-6 text-base")}
              >
                En savoir plus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

// ─── 04. Appartements meublés (galerie + Airbnb) ───────────────────────────
function AppartementsMeublesSection() {
  const gallery = [
    { label: "Chambre à coucher", img: "/images/biens/bien1.jpg", icon: BedDouble },
    { label: "Salle d'eau", img: "/images/biens/bien10.jpg", icon: Bath },
    { label: "Balcon vue mer", img: "/images/biens/bien21.jpg", icon: Wind },
    { label: "Salon", img: "/images/biens/bien6.jpg", icon: Sofa },
  ];

  return (
    <MotionSection as="section" className="bg-primary/5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Texte */}
          <div>
            <Eyebrow num="04" label="Appartements meublés" />
            <h2 className="font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
              Nous sommes spécialisés dans les{" "}
              <span className="italic text-primary">appartements meublés</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700">
              Logements neufs clé en main, balcons avec belle vue en bordure de
              mer : profitez d&apos;un séjour haut de gamme à Abidjan. Ménage,
              wifi haut débit et parking sécurisé inclus.
            </p>

            {/* Mention Airbnb */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-neutral-700">
              <Sparkles className="h-4 w-4 text-primary" />
              Retrouvez nos logements sur{" "}
              <strong className="text-secondary">Airbnb</strong> · réservation
              24/7
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e"
                className={cn(buttonVariants(), "h-12 px-6 text-base")}
              >
                Réserver un meublé
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact_us"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 px-6 text-base",
                )}
              >
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Galerie 2x2 */}
          <MotionStagger className="grid grid-cols-2 gap-3 sm:gap-4">
            {gallery.map((g) => {
              const Icon = g.icon;
              return (
                <MotionStaggerChild key={g.label}>
                  <div className="group relative aspect-square overflow-hidden rounded-2xl shadow-md">
                    <Image
                      src={g.img}
                      alt={`${g.label} (image à remplacer)`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-white">
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-xs font-semibold">{g.label}</span>
                    </div>
                  </div>
                </MotionStaggerChild>
              );
            })}
          </MotionStagger>
        </div>
      </div>
    </MotionSection>
  );
}
