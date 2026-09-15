"use client";

import * as React from "react";
import Link from "next/link";
import { Modal } from "@heroui/react";
import { ArrowRight, X } from "lucide-react";
import { LecteurVideo } from "./lecteur-video";
import { analyserVideo } from "@/src/lib/video";

/**
 * Vidéo en grand, par-dessus la page.
 *
 * Le plein écran natif existe déjà — l'`<iframe>` le porte, le `<video>` aussi.
 * Il ne suffit pas : sur la carte d'une annonce, la vidéo occupe deux cents
 * pixels de haut, et passer directement de cette vignette au plein écran du
 * système est brutal, surtout sur un ordinateur. Cette étape intermédiaire
 * donne une image large tout en gardant la page derrière.
 *
 * Le lecteur est DÉMONTÉ à la fermeture, et non simplement masqué : une
 * `<iframe>` YouTube cachée continue de jouer, et le son poursuivrait le
 * visiteur sur le reste de la page sans qu'il sache d'où il vient.
 *
 * Pas de `<Modal>` autour : seul `Modal.Backdrop` porte l'état, comme dans
 * l'exemple contrôlé de la documentation. `Modal` est un `DialogTrigger` de
 * React Aria, qui traite son premier enfant comme le déclencheur et lui injecte
 * sa gestion de la pression. Or le déclencheur est fourni ici par l'appelant :
 * c'est tantôt un bouton d'affiche, tantôt un lecteur entier. Le laisser
 * recevoir ce câblage serait un pari sur la forme d'un nœud qu'on ne contrôle
 * pas. La forme contrôlée nous en dispense : l'ouverture ne passe que par
 * `ouvrir()`.
 */
export function ModaleVideo({
  url,
  affiche,
  titre,
  declencheur,
  onChangementOuverture,
  lienBien,
  libelleLien,
}: {
  url: string;
  affiche?: string | null;
  titre?: string | null;
  /**
   * Destination du bien mis en avant.
   *
   * Sans elle, la chaîne « lire → agrandir → rejoindre le bien » casse au
   * dernier maillon : le visiteur qui vient de regarder la visite doit refermer
   * la modale et retrouver la carte pour cliquer dessus.
   */
  lienBien?: string | null;
  libelleLien?: string | null;
  /** Reçoit l'ouverture : c'est l'appelant qui décide de son apparence. */
  declencheur: (ouvrir: () => void) => React.ReactNode;
  /**
   * Prévient l'appelant de l'ouverture et de la fermeture.
   *
   * Utile quand le déclencheur est lui-même un lecteur : l'encart de la fiche
   * d'un bien joue la vidéo sur place, et laisser les deux lecteurs vivants
   * ferait entendre deux bandes-son décalées. L'appelant s'en sert pour
   * remonter le sien, donc l'arrêter.
   */
  onChangementOuverture?: (ouverte: boolean) => void;
}) {
  const [ouverte, setOuverte] = React.useState(false);

  const changer = React.useCallback(
    (valeur: boolean) => {
      setOuverte(valeur);
      onChangementOuverture?.(valeur);
    },
    [onChangementOuverture],
  );

  const lisible = analyserVideo(url) !== null;
  const etiquette = titre?.trim() || "Vidéo";

  // Une adresse illisible ne doit pas laisser un déclencheur qui n'ouvre qu'un
  // cadre vide : mieux vaut ne rien proposer du tout.
  if (!lisible) return null;

  return (
    <>
      {declencheur(() => changer(true))}

      {/* `.modal__backdrop` de HeroUI est en z-50, et le bandeau défilant du
          layout marketing en z-[60] : la vidéo agrandie passait SOUS un ruban
          d'annonces qui continuait de défiler et restait cliquable. Posé en
          style en ligne plutôt qu'en classe : deux utilitaires z-index
          concurrents se départagent par l'ordre du CSS produit, pas par celui
          où on les écrit. */}
      <Modal.Backdrop
        isOpen={ouverte}
        onOpenChange={changer}
        style={{ zIndex: 70 }}
        className="bg-secondary/60 backdrop-blur-md"
      >
        <Modal.Container size="lg">
          <Modal.Dialog
            aria-label={etiquette}
            className="w-full overflow-hidden rounded-[1.5rem] bg-secondary p-0 shadow-2xl sm:max-w-4xl"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <Modal.Heading className="truncate text-sm font-bold uppercase tracking-widest text-white/80">
                {etiquette}
              </Modal.Heading>
              {lienBien && (
                <Link
                  href={lienBien}
                  className="ml-auto inline-flex flex-none items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-secondary transition-colors hover:bg-[#D4981C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {libelleLien?.trim() || "Voir le bien"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <Modal.CloseTrigger
                aria-label="Fermer la vidéo"
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-4 w-4" />
              </Modal.CloseTrigger>
            </div>

            {ouverte && (
              <LecteurVideo
                url={url}
                affiche={affiche}
                titre={etiquette}
                lectureImmediate
                className="rounded-none"
              />
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
