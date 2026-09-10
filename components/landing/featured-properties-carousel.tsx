"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Star,
} from "lucide-react";
import { Card } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FeaturedBien = {
  id: string;
  name: string | null;
  image: string | null;
  prix: number | null;
  prix_month: number | null;
  ville_commune: string | null;
  chambre: number | null;
  salle_bains: number | null;
  capacity: number | null;
  types_bien?: { name: string | null } | null;
  services_bien?: { name: string | null } | null;
};

/**
 * Carousel de biens vedettes avec Embla.
 * - 1 card par slide sur mobile, 2 sur tablet, 3 sur desktop
 * - Boutons prev/next + dots
 * - Auto-loop subtil
 */
export default function FeaturedPropertiesCarousel({
  biens,
}: {
  biens: FeaturedBien[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: biens.length > 3,
    align: "start",
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  if (biens.length === 0) return null;

  return (
    <section className="relative bg-white pt-8 pb-4 sm:pt-24 sm:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-agate text-3xl md:text-5xl font-bold text-secondary leading-tight">
            Biens d'exception
          </h2>
          <Link href="/properties" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-primary transition-colors">
            Voir tous les biens
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group">
          <div ref={emblaRef} className="overflow-hidden -mx-2">
            <div className="flex">
              {biens.map((bien) => (
                <div
                  key={bien.id}
                  className="shrink-0 grow-0 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-2"
                >
                  <PropertyCard bien={bien} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:-translate-x-6 z-10 h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl border border-stone-100 text-stone-600 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${!canScrollPrev ? "hidden" : ""}`}
            aria-label="Précédent"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 lg:translate-x-6 z-10 h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl border border-stone-100 text-stone-600 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${!canScrollNext ? "hidden" : ""}`}
            aria-label="Suivant"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-8">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Aller au slide ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === selectedIndex
                    ? "w-6 bg-[#F5B324]"
                    : "w-2 bg-stone-200 hover:bg-stone-300",
                )}
              />
            ))}
          </div>
        )}

        {/* CTA mobile only */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Button asChild className="rounded-full">
            <Link href="/properties">
              Toutes les propriétés
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================

function PropertyCard({ bien }: { bien: FeaturedBien }) {
  // Use price calculation
  const price = bien.prix != null ? bien.prix : bien.prix_month;
  
  return (
    <Link
      href={`/properties/${bien.id}`}
      className="group block rounded-[2rem] aspect-[3/4] sm:aspect-[4/5] md:h-[400px] lg:h-[420px] relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE]"
    >
      <div className="absolute inset-0 bg-stone-200">
        {bien.image ? (
          <Image
            src={bien.image}
            alt={bien.name ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
      </div>

      {/* Dark gradient overlay from bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Badge Top Left */}
      <div className="absolute top-4 left-4">
        {bien.services_bien?.name && (
          <span className="inline-flex items-center rounded-md bg-[#1B3C35] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <Star className="h-3 w-3 text-[#F5B324] mr-1 fill-current" />
            4.8
          </span>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end">
        <h3 className="font-bold text-lg md:text-xl text-white leading-tight mb-1 line-clamp-1">
          {bien.ville_commune ?? bien.name ?? "Bien immobilier"}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm font-medium text-white/80 line-clamp-1">
            {bien.types_bien?.name ?? bien.name ?? "Découvrez cette pépite"}
          </p>
          {price != null && (
            <div className="shrink-0 flex items-baseline">
              <span className="text-[#F5B324] font-bold text-lg">
                {price.toLocaleString("fr-FR")}
              </span>
              <span className="text-[#F5B324] text-[10px] font-semibold ml-0.5">FCFA</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}