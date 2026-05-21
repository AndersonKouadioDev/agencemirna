"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PosterItem = {
  id: string;
  title: string;
  image: string;
  href: string;
};

/**
 * Carousel horizontal "Affiches & Créas" : défilé à la Instagram Stories.
 * - Cards aspect 4/5 (format poster Facebook/IG)
 * - Embla autoplay-like (interval simple) + boutons prev/next
 * - Hover : overlay gradient + "Voir l'offre"
 * - Loop infini
 */
export default function PostersCarouselClient({
  posters,
}: {
  posters: PosterItem[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: posters.length > 3,
    align: "start",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  // Autoplay subtil : avance toutes les 4s, pause sur interaction
  React.useEffect(() => {
    if (!emblaApi || posters.length <= 3) return;
    const id = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 4500);
    return () => clearInterval(id);
  }, [emblaApi, posters.length]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi]);

  if (posters.length === 0) return null;

  return (
    <section className="relative bg-white py-14 sm:py-20 border-y border-stone-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">
              <Sparkles className="h-3 w-3" />
              Nos dernières créas
            </p>
            <h2 className="font-agate text-2xl sm:text-3xl md:text-4xl font-bold text-secondary leading-tight">
              Affiches & offres du moment
            </h2>
          </div>
          {/* Controls desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Affiche précédente"
              disabled={!canScrollPrev && !emblaApi?.canScrollPrev()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-neutral-700 hover:bg-stone-100 hover:border-primary/40 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Affiche suivante"
              disabled={!canScrollNext && !emblaApi?.canScrollNext()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-neutral-700 hover:bg-stone-100 hover:border-primary/40 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden -mx-3">
          <div className="flex">
            {posters.map((p) => (
              <div
                key={p.id}
                className="shrink-0 grow-0 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-3"
              >
                <Link
                  href={p.href}
                  className="group block relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 75vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                  />
                  {/* Overlay gradient permanent (lisibilité titre) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent" />
                  {/* Icône hover */}
                  <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                  {/* Titre bas */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-agate text-lg leading-snug line-clamp-3 drop-shadow-md">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile : "Tout voir" */}
        <div className="mt-6 flex sm:hidden justify-center">
          <Link
            href="/promotions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
          >
            Voir toutes les offres
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
