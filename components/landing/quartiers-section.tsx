import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import { getActiveQuartiers } from "@/src/actions/public";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Section "Nos quartiers" : vitrine des zones où Mirna opère.
 *
 * Server Component qui charge les quartiers depuis Supabase (table `quartiers`,
 * configurable via admin). Fallback statique si DB vide pour ne jamais avoir
 * une section vide.
 *
 * Chaque card est cliquable → /properties?q=<search_query|name> pour préfiltrer
 * le listing (matche address + ville + name en includes()).
 */

const FALLBACK_QUARTIERS = [
  {
    id: "fallback-cocody",
    name: "Cocody",
    commune: "Abidjan",
    badge: "Premium",
    tagline: "Le prestige résidentiel",
    description:
      "Riviera, Angré, II Plateaux : ambassades, lycées internationaux, villas avec jardin.",
    image: "/images/biens/bien6.jpg",
    search_query: "Cocody",
    ordre: 1,
    is_featured: true,
  },
  {
    id: "fallback-plateau",
    name: "Plateau",
    commune: "Abidjan",
    badge: "Business",
    tagline: "Le cœur d'affaires",
    description:
      "CBD d'Abidjan, tours modernes, sièges sociaux et appartements haut de gamme.",
    image: "/images/biens/bien1.jpg",
    search_query: "Plateau",
    ordre: 2,
    is_featured: true,
  },
  {
    id: "fallback-marcory",
    name: "Marcory",
    commune: "Abidjan",
    badge: "Lifestyle",
    tagline: "L'art de vivre moderne",
    description:
      "Zone 4, résidentielle, restaurants tendances et accès rapide au reste de la ville.",
    image: "/images/biens/bien10.jpg",
    search_query: "Marcory",
    ordre: 3,
    is_featured: true,
  },
  {
    id: "fallback-riviera",
    name: "Riviera",
    commune: "Abidjan",
    badge: "Familles",
    tagline: "Le calme à 15 min du centre",
    description:
      "Espaces verts, résidences sécurisées, idéal pour les familles et les expats.",
    image: "/images/biens/bien3.jpg",
    search_query: "Riviera",
    ordre: 4,
    is_featured: true,
  },
] as const;

export default async function QuartiersSection() {
  const fromDb = await getActiveQuartiers({ featured: true, limit: 8 });
  const quartiers = fromDb.length > 0 ? fromDb : FALLBACK_QUARTIERS;

  return (
    <MotionSection className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Nos quartiers
          </p>
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
            Trouvez votre adresse à Abidjan
          </h2>
          <p className="mt-4 text-base text-neutral-700 leading-relaxed">
            Chaque quartier a son ADN. Découvrez les zones où l'Agence Mirna
            opère et explorez les biens disponibles en un clic.
          </p>
        </div>

        {/* Grille adaptative */}
        <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quartiers.map((q) => {
            const href = `/properties?q=${encodeURIComponent(q.search_query ?? q.name)}`;
            return (
              <MotionStaggerChild key={q.id}>
                <Link
                  href={href}
                  className="group block relative overflow-hidden rounded-2xl aspect-[4/5] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                >
                  <Image
                    src={q.image}
                    alt={`Quartier ${q.name} à ${q.commune}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/40 to-transparent" />

                  {/* Badge */}
                  {q.badge && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {q.badge}
                      </span>
                    </div>
                  )}

                  {/* Icône hover */}
                  <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>

                  {/* Texte bas */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-white/80 mb-1.5">
                      <MapPin className="h-3 w-3" />
                      {q.commune}
                    </div>
                    <h3 className="font-agate text-2xl font-bold leading-tight mb-1">
                      {q.name}
                    </h3>
                    {q.tagline && (
                      <p className="text-xs text-primary font-medium mb-2">
                        {q.tagline}
                      </p>
                    )}
                    {q.description && (
                      <p className="text-xs text-white/75 leading-relaxed line-clamp-2 max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500">
                        {q.description}
                      </p>
                    )}
                  </div>
                </Link>
              </MotionStaggerChild>
            );
          })}
        </MotionStagger>
      </div>
    </MotionSection>
  );
}
