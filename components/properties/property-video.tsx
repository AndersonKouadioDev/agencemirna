"use client";

import React from "react";
import { PlayCircle } from "lucide-react";
import { LecteurVideo } from "@/components/video/lecteur-video";
import { videoLisible } from "@/src/lib/video";

/**
 * La visite filmée d'un bien (`biens.lien_video`).
 *
 * La reconnaissance de l'adresse et le lecteur vivent maintenant dans
 * `src/lib/video.ts` et `components/video/lecteur-video.tsx`, partagés avec les
 * annonces. Ce composant n'apporte plus que l'habillage de section.
 *
 * Deux gains au passage : la visite accepte désormais Vimeo et un fichier
 * .mp4 direct, pas seulement YouTube ; et elle ne charge plus l'`<iframe>` tant
 * que le visiteur n'a pas cliqué — la fiche d'un bien posait jusqu'ici le
 * lecteur YouTube au chargement, avec ses scripts et ses traceurs, que la
 * vidéo soit regardée ou non.
 */
export default function PropertyVideo({
  videoUrl,
  poster,
}: {
  videoUrl?: string | null;
  /** Affiche facultative. À défaut, la miniature du fournisseur. */
  poster?: string | null;
}) {
  if (!videoLisible(videoUrl)) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold font-agate text-secondary mb-6 flex items-center gap-2">
        <PlayCircle className="h-6 w-6 text-primary" />
        Visite en vidéo
      </h3>
      <LecteurVideo
        url={videoUrl!}
        affiche={poster}
        titre="Visite du bien"
        className="shadow-md border border-stone-100"
      />
    </div>
  );
}
