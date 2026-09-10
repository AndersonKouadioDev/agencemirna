"use client";

import { cn } from "@/lib/utils";

/**
 * Composant vidéo en arrière-plan plein écran pour le Hero.
 */
export function HeroBgVideo() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-20 overflow-hidden bg-secondary"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover object-center opacity-80"
        src="https://cdn.pixabay.com/video/2019/04/16/22791-331003719_large.mp4"
      />
    </div>
  );
}
