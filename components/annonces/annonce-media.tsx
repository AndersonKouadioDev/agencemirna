"use client";

import * as React from "react";
import Image from "next/image";
import { Megaphone, Play } from "lucide-react";
import { ModaleVideo } from "@/components/video/modale-video";
import { analyserVideo } from "@/src/lib/video";
import { normaliserUrlImage } from "@/src/lib/image-url";
import type { MediaAnnonce } from "@/src/lib/annonce";

/**
 * Le visuel d'une carte d'annonce : image, ou vidéo à regarder.
 *
 * Le bouton de lecture ne joue PAS la vidéo sur place, il ouvre la modale.
 * Deux raisons. La carte fait un tiers de colonne : une vidéo lue à cette
 * taille est illisible, et l'agrandir était justement la demande. Surtout, la
 * carte entière pointe vers le bien — un lecteur inséré dedans obligerait le
 * visiteur à viser entre deux actions superposées. Un clic, une intention :
 * l'affiche ouvre la vidéo, le reste de la carte mène au bien.
 */
export function AnnonceMedia({
  media,
  titre,
  legende,
  lienBien,
  libelleLien,
}: {
  media: MediaAnnonce;
  titre: string;
  /** Repère de lieu posé en surimpression, en bas à gauche. */
  legende?: string | null;
  /** Reprise dans la vidéo agrandie : la carte devient inatteignable de là. */
  lienBien?: string | null;
  libelleLien?: string | null;
}) {
  const cadre =
    "relative w-full aspect-video overflow-hidden rounded-xl bg-stone-100 mb-6 mt-auto";

  // `pointer-events-none` : ce repère n'est qu'une étiquette. Posé au-dessus du
  // visuel, il avalait le clic dans son coin — ni lecture de la vidéo, ni
  // navigation vers le bien, sans que rien ne l'explique.
  const repere = legende ? (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[3] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-stone-600 shadow-sm">
      {legende}
    </div>
  ) : null;

  if (media?.type === "video") {
    // L'affiche saisie en admin d'abord ; à défaut, celle que le fournisseur
    // publie. Ni l'une ni l'autre pour un Vimeo ou un fichier direct : le dégradé
    // ci-dessous vaut mieux qu'un cadre noir sans explication.
    //
    // La miniature repasse par `normaliserUrlImage` comme le reste : next/image
    // LÈVE pour une adresse hors motif, ce qui ferait tomber la page /annonces
    // entière — pas seulement la carte.
    const miniature = normaliserUrlImage(analyserVideo(media.url)?.miniature);
    const affiche =
      media.affiche ?? (typeof miniature === "string" ? miniature : null);

    return (
      // La carte porte un lien étiré, peint en z-[1]. Le bouton de lecture doit
      // passer au-dessus, d'où z-[2] — sans quoi le lien capterait le clic.
      <div className={`${cadre} z-[2]`}>
        <ModaleVideo
          url={media.url}
          affiche={media.affiche}
          titre={titre}
          lienBien={lienBien}
          libelleLien={libelleLien}
          declencheur={(ouvrir) => (
            <button
              type="button"
              onClick={ouvrir}
              aria-label={`Lire la vidéo : ${titre}`}
              // Le bouton n'ouvre pas la vidéo sur place mais une boîte de
              // dialogue : sans cela, un lecteur d'écran annonce « bouton » et
              // le changement de contexte surprend.
              aria-haspopup="dialog"
              className="group/video absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            >
              {affiche ? (
                <Image
                  src={affiche}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover/video:scale-105"
                />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-br from-secondary to-stone-800" />
              )}
              <span className="absolute inset-0 bg-black/25 transition-colors group-hover/video:bg-black/40" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-secondary shadow-xl transition-transform duration-300 group-hover/video:scale-110">
                  {/* Décalé d'un cheveu : un triangle centré géométriquement
                      paraît toujours collé à gauche dans un cercle. */}
                  <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                </span>
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                Vidéo
              </span>
            </button>
          )}
        />
        {repere}
      </div>
    );
  }

  // Mode image : aucun z-index. Le cadre reste `relative` (les visuels sont en
  // `fill`), mais un élément positionné sans z-index se peint dans l'ordre du
  // DOM — donc APRÈS le titre, donc au-dessus du pseudo-élément du lien étiré.
  // C'est pourquoi le lien porte z-[1] : il repasse devant, et toute la carte
  // redevient cliquable, visuel compris, comme elle l'était avant.
  return (
    <div className={cadre}>
      {media?.type === "image" ? (
        <Image
          src={media.url}
          alt={titre}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Megaphone className="h-8 w-8 text-stone-300" />
        </div>
      )}
      {repere}
    </div>
  );
}
