"use client";

import * as React from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import HeroSearchBar from "./hero-search-bar";
import { HeroBgCarousel } from "./hero-bg-carousel";

/**
 * Hero plein écran avec carousel de fond SYNCHRONISÉ texte + image.
 *
 * Chaque slide a son image, son titre et sa description : ils cross-fadent
 * ensemble (même index, piloté ici). Le badge, les CTA, la barre de recherche
 * et les trust signals restent statiques.
 *
 * Overlay noir léger (façon maquette) : on garde l'image bien visible tout en
 * assurant la lisibilité du texte blanc (renforcée par un text-shadow).
 *
 * Accessibilité :
 *  - Seule la slide active porte le <h1> (les autres = <div> aria-hidden) →
 *    un seul titre dans l'arbre d'accessibilité.
 *  - Respecte prefers-reduced-motion : fige sur la 1ère slide, sans zoom.
 */

type HeroSlide = {
  image: string;
  /** Titre avec un mot mis en avant (primary italic). */
  title: React.ReactNode;
  description: string;
};

const SLIDES: HeroSlide[] = [
  {
    image: "/images/photos/immeuble1.jpg",
    title: (
      <>
        Trouvez le bien de vos{" "}
        <span className="italic text-primary">rêves</span> à Abidjan
      </>
    ),
    description:
      "Studios meublés, appartements, villas, terrains : explorez notre sélection premium.",
  },
  {
    image: "/images/photos/immeuble.jpeg",
    title: (
      <>
        <span className="italic text-primary">Vendez</span> ou louez en toute
        sérénité
      </>
    ),
    description:
      "Mandat sérieux, estimation gratuite, accompagnement jusqu'à la signature.",
  },
  {
    image: "/images/biens/bien15.jpg",
    title: (
      <>
        Des biens <span className="italic text-primary">d&apos;exception</span>,
        rien que pour vous
      </>
    ),
    description:
      "Chaque bien de notre catalogue est vérifié et mis en valeur par nos soins.",
  },
  {
    image: "/images/biens/bien1.jpg",
    title: (
      <>
        La <span className="italic text-primary">gestion</span> locative, sans
        les soucis
      </>
    ),
    description:
      "Locataires sélectionnés, loyers encaissés, suivi technique assuré.",
  },
  {
    image: "/images/biens/bien21.jpg",
    title: (
      <>
        <span className="italic text-primary">Construisons</span> votre projet
        immobilier
      </>
    ),
    description:
      "De la promotion à la décoration, nos experts donnent vie à vos idées.",
  },
];

const IMAGES = SLIDES.map((s) => s.image);
const INTERVAL = 6000;

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion || SLIDES.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[90vh] items-center overflow-hidden"
    >
      {/* Carousel d'images en fond (contrôlé : même index que le texte) */}
      <HeroBgCarousel
        images={IMAGES}
        activeIndex={index}
        animate={!reduceMotion}
      />

      {/* Overlay noir léger (façon maquette) : dégradé gauche→droite pour
          garder l'image visible à droite, lisibilité du texte à gauche */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/45 to-black/10"
      />
      {/* Vignette bas pour ancrer la barre de recherche */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pt-36 pb-20">
        <div className="max-w-3xl">
          {/* Badge statique */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Votre partenaire immobilier depuis 2022
          </div>

          {/* Titre + description rotatifs (cross-fade synchro avec l'image).
              Hauteur réservée pour éviter tout décalage des CTA en dessous. */}
          <div className="relative mt-6 min-h-[260px] sm:min-h-[240px] lg:min-h-[260px]">
            {SLIDES.map((slide, i) => {
              const active = i === index;
              const TitleTag = active ? "h1" : "div";
              return (
                <div
                  key={i}
                  aria-hidden={active ? undefined : "true"}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    active ? "opacity-100" : "opacity-0",
                    !active && "pointer-events-none",
                  )}
                >
                  <TitleTag className="font-agate text-5xl font-bold leading-[1.03] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </TitleTag>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA statiques */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/properties"
              className={cn(buttonVariants(), "h-12 px-7 text-base shadow-xl")}
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
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/85">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-black/30 bg-gradient-to-br from-primary/60 to-white/40"
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
