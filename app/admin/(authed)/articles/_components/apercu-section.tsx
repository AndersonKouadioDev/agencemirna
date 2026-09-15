import {
  ArticleSections,
  preparerSections,
} from "@/app/(marketing)/actualites/[slug]/article-sections";
import type { PositionImage } from "@/src/lib/article-sections";

/**
 * Aperçu d'une section, rendu par le composant de la vitrine lui-même.
 *
 * Le rédacteur compose SUR cet aperçu : une mise en page réécrite ici dérive de
 * la page publique au premier ajustement — grille des images, format des
 * visuels, côté du flottant, seuil de passage en colonnes — et l'aperçu ment
 * alors sans que personne ne s'en aperçoive avant la publication. On passe donc
 * par <ArticleSections>, le composant que la page publique appelle.
 *
 * `preparerSections` écarte au passage les adresses d'images que next/image
 * refuserait : sans ce filtre, une URL vide ou d'un hôte non déclaré ferait
 * tomber le rendu ici exactement comme en production.
 */
export function ApercuSection({
  cle,
  titre,
  contenuMd,
  images,
  position,
  titreArticle,
}: {
  /** Identifiant de brouillon : la vitrine numérote ses sections par `id`. */
  cle: string;
  titre: string;
  contenuMd: string;
  images: string[];
  position: PositionImage;
  /** Repris du formulaire : il sert d'alternative textuelle aux images. */
  titreArticle: string;
}) {
  const preparees = preparerSections([
    {
      id: cle,
      ordre: 0,
      titre,
      contenu_md: contenuMd,
      images,
      position_image: position,
    },
  ]);

  // `preparerSections` écarte une section qui n'a rien à montrer : c'est aussi
  // ce que fera la page publique, on le dit plutôt que de laisser un vide.
  if (preparees.length === 0) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-neutral-400 italic">
        Rien à afficher pour l&apos;instant. L&apos;aperçu suivra le titre, le
        texte et les images de la section.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <ArticleSections
        sections={preparees}
        titreArticle={titreArticle.trim() || "Article"}
      />
    </div>
  );
}
