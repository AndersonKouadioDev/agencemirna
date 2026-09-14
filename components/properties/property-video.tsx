"use client";

import React from "react";
import { PlayCircle } from "lucide-react";

export default function PropertyVideo({ videoUrl }: { videoUrl?: string | null }) {
  if (!videoUrl) return null;

  // Extract YouTube ID
  let videoId = "";
  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") || "";
      // Les liens partagés depuis l'application mobile, une diffusion ou un
      // code d'intégration n'ont pas de paramètre `v` : l'identifiant est
      // alors le segment qui suit /shorts/, /embed/, /live/ ou /v/.
      if (!videoId) {
        videoId =
          url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1] ?? "";
      }
    } else if (url.hostname.includes("youtu.be")) {
      // `slice(1)` gardait les segments suivants d'un lien de playlist.
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    }
  } catch {
    // URL invalide
    return null;
  }

  if (!videoId) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold font-agate text-secondary mb-6 flex items-center gap-2">
        <PlayCircle className="h-6 w-6 text-primary" />
        Visite en vidéo
      </h3>
      <div className="relative rounded-2xl overflow-hidden aspect-video shadow-md border border-stone-100">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Vidéo du bien"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
