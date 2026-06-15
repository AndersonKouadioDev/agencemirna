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

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  if (biens.length === 0) return null;

  return (
    <section className="relative bg-[#FAF5EE] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Catalogue
            </p>
            <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Nos biens disponibles
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Bien précédent"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-neutral-700 hover:bg-stone-100 hover:border-primary/40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Bien suivant"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-neutral-700 hover:bg-stone-100 hover:border-primary/40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Button asChild className="ml-3 rounded-full hidden sm:inline-flex">
              <Link href="/properties">
                Tout voir
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden -mx-3">
          <div className="flex">
            {biens.map((bien) => (
              <div
                key={bien.id}
                className="shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 px-3"
              >
                <PropertyCard bien={bien} />
              </div>
            ))}
          </div>
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
                    ? "w-8 bg-primary"
                    : "w-2 bg-stone-300 hover:bg-stone-400",
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
  return (
    <Link
      href={`/properties/${bien.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE] rounded-2xl h-full"
    >
      <Card
        variant="default"
        className="bg-white border-stone-200 overflow-hidden h-full group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
          {bien.image ? (
            <Image
              src={bien.image}
              alt={bien.name ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {bien.services_bien?.name && (
              <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-primary shadow-sm">
                {bien.services_bien.name}
              </span>
            )}
            {bien.types_bien?.name && (
              <span className="inline-flex items-center rounded-full bg-secondary/85 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                {bien.types_bien.name}
              </span>
            )}
          </div>
        </div>

        <Card.Header className="pt-5 pb-1">
          <Card.Title className="font-agate text-xl text-secondary leading-tight line-clamp-1">
            {bien.name ?? "(sans nom)"}
          </Card.Title>
          {bien.ville_commune && (
            <Card.Description className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
              <MapPin className="h-3 w-3" />
              {bien.ville_commune}
            </Card.Description>
          )}
        </Card.Header>

        <Card.Content className="pb-3">
          {/* Caractéristiques */}
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            {bien.chambre != null && (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {bien.chambre}
              </span>
            )}
            {bien.salle_bains != null && (
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {bien.salle_bains}
              </span>
            )}
            {bien.capacity != null && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {bien.capacity}
              </span>
            )}
          </div>
        </Card.Content>

        <Card.Footer className="pt-2 pb-5 border-t border-stone-100">
          <div className="flex items-baseline justify-between w-full pt-3">
            <div>
              {bien.prix != null && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-secondary">
                    {bien.prix.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-xs text-neutral-500">FCFA</span>
                </div>
              )}
              {bien.prix_month != null && bien.prix_month !== bien.prix && (
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  /mois : {bien.prix_month.toLocaleString("fr-FR")} FCFA
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
              Voir
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Card.Footer>
      </Card>
    </Link>
  );
}
