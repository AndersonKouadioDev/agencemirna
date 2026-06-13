import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import HeroSearchBar from "./hero-search-bar";

/**
 * Hero plein écran (refonte inspirée des landing pages premium) :
 *   - Image de fond plein cadre + overlay marron (secondary) pour le contraste
 *   - Grande baseline éditoriale font-agate
 *   - 2 CTA (Voir les biens / Estimation gratuite)
 *   - Barre de recherche HeroUI intégrée (réutilisée de /properties)
 *   - Bande de trust signals en bas
 *
 * Accessibilité : texte blanc sur overlay marron foncé (hsl 36 64% 13% ≈ near
 * black) → contraste largement > 4.5:1. Les CTA respectent 44px de hauteur.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[90vh] items-center overflow-hidden"
    >
      {/* Image de fond plein cadre */}
      <Image
        src="/images/photos/immeuble1.jpg"
        alt="Immeuble résidentiel à Abidjan"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center -z-20"
      />
      {/* Overlay marron : dégradé gauche→droite pour garder l'image visible à
          droite tout en assurant la lisibilité du texte à gauche */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40"
      />
      {/* Vignette bas pour ancrer la barre de recherche */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-secondary/70 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pt-36 pb-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Votre partenaire immobilier depuis 2022
          </div>

          {/* Titre */}
          <h1 className="mt-6 font-agate text-5xl font-bold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Trouvez le bien <br className="hidden sm:block" />
            de vos <span className="italic text-primary">rêves</span> à Abidjan
          </h1>

          {/* Sous-titre */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            Studios meublés, appartements, villas, terrains : explorez notre
            sélection ou laissez nos experts trouver le bien parfait pour vous.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/properties"
              className={cn(
                buttonVariants(),
                "h-12 px-7 text-base shadow-xl",
              )}
            >
              Voir les biens
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/estimation"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 px-7 text-base border-white/50 bg-white/5 text-white backdrop-blur hover:bg-white hover:text-secondary",
              )}
            >
              Estimation gratuite
            </Link>
          </div>

          {/* Barre de recherche intégrée */}
          <div className="mt-10">
            <HeroSearchBar />
          </div>

          {/* Trust signals */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-secondary bg-gradient-to-br from-primary/60 to-white/40"
                  />
                ))}
              </div>
              <span>
                <strong className="text-white">100+</strong> clients satisfaits
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex text-primary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                ))}
              </span>
              <span>Confiance reconnue à Abidjan</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
