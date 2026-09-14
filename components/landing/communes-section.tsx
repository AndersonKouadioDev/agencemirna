import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { PublicCommune, CatalogueFacettes } from "@/src/actions/public";

type Card = {
  id: string;
  nom: string;
  tagline: string | null;
  image: string | null;
  slug: string;
};

/**
 * Section « Communes phares » de l'accueil.
 *
 * Ce sont bien les COMMUNES qui sont mises en avant ici : ce sont elles qui
 * contiennent les quartiers, et c'est sur elles que porte le premier niveau
 * de filtrage du catalogue.
 */
export default function CommunesSection({
  communes = [],
  facettes,
}: {
  communes?: PublicCommune[];
  facettes?: CatalogueFacettes;
}) {
  // La liste reçue contient toutes les communes actives, y compris celles qui
  // ne portent aucun bien : leur carte menait à un catalogue vide. On applique
  // la même garde par facettes que le méga-menu. Comptage indisponible : on
  // n'écarte rien, mieux vaut un lien vide qu'une section vide.
  const avecBiens = facettes?.disponible
    ? communes.filter((c) => (facettes.communes[c.id] ?? 0) > 0)
    : communes;

  const versCard = (c: PublicCommune): Card => ({
    id: c.id,
    nom: c.nom,
    tagline: c.tagline,
    image: c.image,
    slug: c.slug,
  });

  const featured = avecBiens.filter((c) => c.is_featured).map(versCard);

  // Aucune commune cochée « à la une » parmi celles qui portent un bien : on
  // complète avec des communes réelles plutôt qu'avec des cartes inventées,
  // et on masque la section si la base n'a vraiment rien à montrer.
  const cards: Card[] = (
    featured.length > 0 ? featured : avecBiens.map(versCard)
  ).slice(0, 3);

  if (cards.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-black">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
              Emplacements <span>✦</span>
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-white leading-tight">
              Communes Phares
            </h2>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-sm font-bold text-white/80 hover:text-white transition-colors"
          >
            Découvrir tous nos biens
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((area) => (
            <Link
              key={area.id}
              href={`/properties?commune=${encodeURIComponent(area.slug)}` as any}
              className="group relative rounded-[2rem] overflow-hidden aspect-[4/3] md:aspect-square lg:aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-500 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-stone-800"
            >
              {/* `communes.image` est nullable : sans garde, next/image casse
                  le rendu serveur de toute la page d'accueil. */}
              {area.image && (
                <Image
                  src={area.image}
                  alt={area.nom}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3C35]/90 via-[#1B3C35]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-2xl md:text-3xl text-white mb-2">
                  {area.nom}
                </h3>
                {area.tagline && (
                  <p className="text-white/80 font-medium">{area.tagline}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
