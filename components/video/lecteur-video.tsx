"use client";

import * as React from "react";
import Image from "next/image";
import { Maximize2, Play } from "lucide-react";
import { analyserVideo, urlIntegration } from "@/src/lib/video";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { cn } from "@/lib/utils";

/**
 * Lecteur de vidéo : affiche figée, puis lecture au clic.
 *
 * Rien n'est chargé tant que le visiteur n'a pas cliqué. Trois cartes
 * d'annonces vidéo poseraient sinon trois `<iframe>` YouTube au chargement de
 * la page — plus d'un mégaoctet de scripts tiers pour des vidéos que personne
 * ne regardera peut-être, et autant de traceurs déposés d'office.
 *
 * L'affiche n'est donc pas un détail de présentation : c'est ce qui rend ce
 * report possible. À défaut d'affiche saisie en admin, YouTube en publie une à
 * adresse devinable ; Vimeo non, et un fichier direct encore moins — on tombe
 * alors sur un aplat sobre plutôt que sur un cadre noir.
 */
/** L'adresse si next/image sait la rendre, `null` sinon. */
function rendable(url: string | null | undefined): string | null {
  const v = normaliserUrlImage(url);
  return typeof v === "string" ? v : null;
}

export function LecteurVideo({
  url,
  affiche,
  titre,
  className,
  lectureImmediate = false,
  suspendre = false,
  onAgrandir,
}: {
  url: string;
  /** Image montrée avant lecture. Ignorée si elle n'est pas rendable. */
  affiche?: string | null;
  titre?: string | null;
  className?: string;
  /** Démarre sans passer par l'affiche : la modale, déjà ouverte par un clic. */
  lectureImmediate?: boolean;
  /**
   * Ramène le lecteur à son affiche, donc coupe le son.
   *
   * Remonter le composant avec un `key` aurait le même effet, mais arracherait
   * le déclencheur du DOM pendant que React Aria referme la modale : le focus,
   * qui devait lui revenir, retombe alors sur `<body>` et le visiteur au
   * clavier repart du haut de la page.
   */
  suspendre?: boolean;
  /** Rendu en surimpression quand fourni : « voir en grand ». */
  onAgrandir?: () => void;
}) {
  const source = React.useMemo(() => analyserVideo(url), [url]);
  const [enLecture, setEnLecture] = React.useState(lectureImmediate);

  // Changer de vidéo sans remonter le composant doit ramener l'affiche : sinon
  // le lecteur de la vidéo précédente resterait à l'écran, et jouerait même le
  // nouveau flux sans que le visiteur ait rien demandé.
  //
  // Ajusté pendant le rendu plutôt que dans un effet : React réexécute alors le
  // composant immédiatement, sans peindre l'état périmé. Un `useEffect` aurait
  // affiché une image de trop — celle de l'ancienne vidéo, déjà lancée.
  // https://react.dev/learn/you-might-not-need-an-effect
  const [urlRendue, setUrlRendue] = React.useState(url);
  if (url !== urlRendue) {
    setUrlRendue(url);
    setEnLecture(lectureImmediate);
  }

  // Même motif pour la suspension demandée de l'extérieur.
  const [suspensionRendue, setSuspensionRendue] = React.useState(suspendre);
  if (suspendre !== suspensionRendue) {
    setSuspensionRendue(suspendre);
    if (suspendre) setEnLecture(false);
  }

  // Une adresse non reconnue ne doit jamais atteindre un `<iframe>` : on ne
  // rend rien plutôt qu'un cadre noir inexplicable.
  if (!source) return null;

  // `normaliserUrlImage` renvoie `undefined` pour une adresse que next/image
  // ferait lever : elle est écartée comme une absence, pas propagée.
  //
  // La miniature du fournisseur y passe AUSSI. Elle est pourtant construite par
  // nous, à partir d'un identifiant déjà validé — mais c'est exactement le
  // raisonnement qui a laissé passer `?v=..` : « cette adresse est sûre, elle
  // vient de chez nous ». Une seule porte devant next/image, pour tout le monde.
  const poster =
    rendable(affiche) ?? rendable(source.miniature);

  const etiquette = titre?.trim() || "Vidéo";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-stone-900",
        className,
      )}
    >
      <div className="relative aspect-video w-full">
        {enLecture ? (
          source.fichier ? (
            <video
              src={source.fichier}
              poster={poster ?? undefined}
              controls
              autoPlay
              // Sans `playsInline`, iOS bascule en plein écran natif dès la
              // lecture : le visiteur perd la page, et le bouton « agrandir »
              // ci-dessous n'a plus aucun sens.
              playsInline
              className="absolute inset-0 h-full w-full bg-black object-contain"
            />
          ) : (
            <iframe
              src={urlIntegration(source, { lectureAutomatique: true }) ?? undefined}
              title={etiquette}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setEnLecture(true)}
            aria-label={`Lire la vidéo : ${etiquette}`}
            // `-inset-*` serait rogné par l'overflow-hidden du cadre : l'anneau
            // est posé vers l'intérieur pour rester entièrement visible.
            className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          >
            {poster ? (
              <Image
                src={poster}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-stone-800" />
            )}
            <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-secondary shadow-xl transition-transform duration-300 group-hover:scale-110">
                {/* Décalé d'un cheveu : un triangle centré géométriquement
                    paraît toujours collé à gauche dans un cercle. */}
                <Play className="h-6 w-6 translate-x-0.5 fill-current" />
              </span>
            </span>
          </button>
        )}
      </div>

      {onAgrandir && (
        <button
          type="button"
          onClick={onAgrandir}
          aria-label="Voir la vidéo en grand"
          aria-haspopup="dialog"
          title="Voir en grand"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
