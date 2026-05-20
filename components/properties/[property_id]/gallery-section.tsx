"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Galerie de photos d'un bien sur la fiche détail.
 * Layout :
 *   - Carrousel principal Embla, aspect 16/9, plein écran (jusqu'à max-w)
 *   - Boutons prev/next + compteur (3 / 22)
 *   - Bouton expand → ouvre une lightbox fullscreen
 *   - Strip de thumbnails sous le carrousel principal
 * Utilise bien.images (array d'URLs) chargé par getBienWithImages().
 */
export default function GallerySection({ bien }: { bien: { images?: string[]; name?: string } }) {
  const images: string[] = Array.isArray(bien?.images) ? bien.images : [];
  const propertyName = bien?.name ?? "Propriété";

  if (images.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="relative isolate bg-primary/5 pt-20 pb-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-agate font-bold">
            Galerie de la propriété
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            {images.length} photo{images.length > 1 ? "s" : ""}
          </p>
        </header>

        <GalleryCarousel images={images} propertyName={propertyName} />
      </div>
    </section>
  );
}

// ============================================================================

function GalleryCarousel({
  images,
  propertyName,
}: {
  images: string[];
  propertyName: string;
}) {
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mainApi || !thumbsApi) return;
    const onSelect = () => {
      const i = mainApi.selectedScrollSnap();
      setSelectedIndex(i);
      thumbsApi.scrollTo(i);
    };
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    onSelect();
  }, [mainApi, thumbsApi]);

  const onThumbClick = React.useCallback(
    (i: number) => mainApi?.scrollTo(i),
    [mainApi],
  );

  return (
    <>
      {/* Carrousel principal */}
      <div className="relative">
        <div ref={mainRef} className="overflow-hidden rounded-2xl shadow-xl">
          <div className="flex">
            {images.map((url, i) => (
              <div
                key={url}
                className="relative shrink-0 grow-0 basis-full aspect-[16/9] bg-stone-100"
              >
                <Image
                  src={url}
                  alt={`${propertyName} — photo ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bouton expand */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/55 backdrop-blur px-3 py-1.5 text-xs font-medium text-white hover:bg-black/70 transition-colors"
          aria-label="Afficher en plein écran"
        >
          <Expand className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Plein écran</span>
        </button>

        {/* Compteur */}
        <div className="absolute bottom-3 right-3 rounded-md bg-black/55 backdrop-blur px-3 py-1.5 text-xs font-medium text-white tabular-nums">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Boutons prev/next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => mainApi?.scrollPrev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => mainApi?.scrollNext()}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="mt-4 overflow-hidden" ref={thumbsRef}>
          <div className="flex gap-2">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => onThumbClick(i)}
                className={cn(
                  "relative shrink-0 h-16 w-24 sm:h-20 sm:w-28 overflow-hidden rounded-md transition-all",
                  selectedIndex === i
                    ? "ring-2 ring-primary opacity-100"
                    : "opacity-60 hover:opacity-100",
                )}
                aria-label={`Voir la photo ${i + 1}`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox fullscreen */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          propertyName={propertyName}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ============================================================================

function Lightbox({
  images,
  propertyName,
  initialIndex,
  onClose,
}: {
  images: string[];
  propertyName: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: initialIndex,
  });
  const [index, setIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
  }, [emblaApi]);

  // Fermer avec Escape, naviguer avec flèches
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [emblaApi, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-label="Galerie plein écran"
    >
      {/* Topbar lightbox */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm tabular-nums">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image carrousel */}
      <div ref={emblaRef} className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative shrink-0 grow-0 basis-full h-full flex items-center justify-center"
            >
              <Image
                src={url}
                alt={`${propertyName} — photo ${i + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority={i === initialIndex}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation prev/next */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Suivant"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}
