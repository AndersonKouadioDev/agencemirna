"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Carousel d'images en fond du hero — composant CONTRÔLÉ : l'index actif et
 * le timer sont gérés par le parent (hero-section) pour que le texte (titre /
 * description) puisse changer en synchronisation avec l'image.
 *
 * - Cross-fade par opacité entre les images
 * - Ken Burns subtil (zoom lent) si `animate` (le parent le coupe sous
 *   prefers-reduced-motion)
 * - Fond purement décoratif → aria-hidden. Placé en -z-20 sous l'overlay.
 */
export function HeroBgCarousel({
  images,
  activeIndex,
  animate = true,
}: {
  images: string[];
  activeIndex: number;
  animate?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-20 overflow-hidden bg-secondary"
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-opacity duration-[1500ms] ease-in-out",
            i === activeIndex ? "opacity-100" : "opacity-0",
            animate && "animate-hero-zoom",
          )}
        />
      ))}
    </div>
  );
}
