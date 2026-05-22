"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { VideoProvider } from "@/lib/video-provider";

/**
 * Player vidéo lazy-loaded.
 *
 * État 1 (initial) : poster + bouton play, RIEN de chargé côté player.
 *   → 0 KB de iframe YouTube/Vimeo, pas de cookies tiers tant que l'user
 *     n'a pas explicitement cliqué. Bon pour la perf ET pour le RGPD.
 *
 * État 2 (après clic) : rend l'iframe (YouTube/Vimeo) ou la balise
 *   <video> HTML5 (fichier direct) en autoplay.
 */
export function VideoPlayer({
  url,
  title,
  poster,
  provider,
  embedUrl,
}: {
  url: string;
  title: string;
  poster: string | null;
  provider: VideoProvider;
  embedUrl: string | null;
}) {
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-2xl bg-black">
      {!playing ? (
        // ─── État poster : photo + overlay + bouton play ─────────────────
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          aria-label={`Lancer la vidéo : ${title}`}
        >
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized={poster.startsWith("http")}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/80" />
          )}

          {/* Overlay sombre subtil pour faire ressortir le bouton */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

          {/* Bouton play centré */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Halo pulse */}
              <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 sm:h-10 sm:w-10 translate-x-1 fill-white" />
              </div>
            </div>
          </div>

          {/* Label au survol */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-semibold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
            Cliquer pour lancer
          </div>
        </button>
      ) : (
        // ─── État playing : iframe ou <video> ────────────────────────────
        <PlayingContent
          url={url}
          title={title}
          provider={provider}
          embedUrl={embedUrl}
        />
      )}
    </div>
  );
}

function PlayingContent({
  url,
  title,
  provider,
  embedUrl,
}: {
  url: string;
  title: string;
  provider: VideoProvider;
  embedUrl: string | null;
}) {
  // YouTube / Vimeo : iframe avec autoplay
  if ((provider === "youtube" || provider === "vimeo") && embedUrl) {
    const src =
      provider === "youtube"
        ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`
        : `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`;
    return (
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  // Fichier direct (.mp4, .webm…) : balise <video> native
  if (provider === "file") {
    return (
      <video
        src={url}
        title={title}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        controls
        autoPlay
        playsInline
      />
    );
  }

  // Fallback inattendu : lien externe
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0 flex items-center justify-center text-white bg-secondary"
    >
      Ouvrir la vidéo dans un nouvel onglet
    </a>
  );
}
