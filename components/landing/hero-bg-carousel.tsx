"use client";

import * as React from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Carousel d'images en fond du hero.
 * - Cross-fade automatique entre les images (pas de contrôle utilisateur :
 *   c'est un fond ambiant, purement décoratif → aria-hidden)
 * - Ken Burns subtil (zoom lent) sur chaque image pour un effet premium
 * - Respecte prefers-reduced-motion : fige sur la 1ère image, sans zoom
 *
 * Placé en position absolue (-z-20) sous l'overlay marron (-z-10) du hero.
 */
export function HeroBgCarousel({
  images,
  interval = 6000,
}: {
  images: string[];
  interval?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [reduceMotion, images.length, interval]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden bg-secondary">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-opacity duration-[1500ms] ease-in-out motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0",
            !reduceMotion && "animate-hero-zoom",
          )}
        />
      ))}
    </div>
  );
}
