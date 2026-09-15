/**
 * Comment un bien annonce son prix.
 *
 * La décision était recopiée dans cinq composants, avec déjà trois réponses
 * différentes pour un bien sans montant : la carte du catalogue masquait le
 * bloc, l'en-tête de la fiche le masquait aussi, et l'encadré de la même fiche
 * affichait « 0 FCFA » par un repli `bien.prix ?? 0`. Les trois se voyaient sur
 * le même bien, à deux écrans d'écart.
 *
 * Tout passe désormais par ce module. Une seule règle en sort :
 * un bien affiche un montant, ou il affiche « Prix sur demande » — jamais rien,
 * jamais zéro.
 */

import { estMeuble, estVente, type BienNature } from "./bien-nature";
import { formatNumber } from "@/utils/formatNumber";

/** Le terme du métier. Déjà employé sur les cartes d'annonces. */
export const PRIX_SUR_DEMANDE = "Prix sur demande";

export type BienPrix = BienNature & {
  prix?: number | null;
  prix_month?: number | null;
  /** Migration 0024. Absente tant qu'elle n'est pas appliquée : `undefined`
   *  se comporte alors comme `false`, et seul le repli sans montant joue. */
  prix_sur_demande?: boolean | null;
};

/**
 * Le montant s'il est publiable, `null` sinon.
 *
 * Zéro est écarté au même titre que `null` : personne ne vend ni ne loue à
 * zéro franc, c'est la saisie vide que l'admin a voulu exprimer — et « 0 FCFA »
 * à l'écran se lit comme un bug, ce qu'il était. `NaN` vient d'un
 * `parseNumber` sur un champ mal rempli ; il ne doit pas non plus s'afficher.
 */
export function montantUtile(valeur: number | null | undefined): number | null {
  return typeof valeur === "number" && Number.isFinite(valeur) && valeur > 0
    ? valeur
    : null;
}

/**
 * Le bien tait-il son prix ?
 *
 * Deux situations distinctes, volontairement fondues ici pour l'affichage mais
 * séparées en base (voir migration 0024) :
 *   • la case est cochée : l'agence a décidé de négocier de vive voix, même si
 *     un montant est saisi pour l'usage interne ;
 *   • aucun montant utile n'est saisi : on ne peut rien annoncer d'autre, mais
 *     le jour où un prix est renseigné il s'affiche aussitôt.
 */
export function prixSurDemande(bien: BienPrix | null | undefined): boolean {
  if (bien?.prix_sur_demande === true) return true;
  return (
    montantUtile(bien?.prix) == null && montantUtile(bien?.prix_month) == null
  );
}

/**
 * Le prix mis en avant : son libellé, son montant, son unité.
 *
 * Le montant et son unité sont choisis ENSEMBLE, et c'est tout l'objet de cette
 * fonction. L'unité a longtemps été figée par le thème de la fiche : un bien
 * meublé sans tarif journalier retombait sur le loyer mensuel tout en gardant
 * « / nuitée », affichant donc un loyer de 1 800 000 FCFA à la nuit.
 */
export type PrixAffiche =
  | { surDemande: true; libelle: string }
  | { surDemande: false; libelle: string; montant: number; suffixe: string };

export function prixPrincipal(bien: BienPrix | null | undefined): PrixAffiche {
  if (prixSurDemande(bien)) {
    return { surDemande: true, libelle: "Prix" };
  }

  const prix = montantUtile(bien?.prix);
  const mensuel = montantUtile(bien?.prix_month);

  if (estVente(bien)) {
    // Un bien en vente n'a pas de loyer : sans montant de vente, `prixSurDemande`
    // a déjà répondu plus haut — sauf si seul `prix_month` est renseigné, ce
    // qui est une erreur de saisie. On préfère alors l'annoncer sur demande
    // plutôt que de présenter un loyer comme un prix de vente.
    return prix != null
      ? { surDemande: false, libelle: "Prix de vente", montant: prix, suffixe: "" }
      : { surDemande: true, libelle: "Prix" };
  }

  if (estMeuble(bien) && prix != null) {
    return {
      surDemande: false,
      libelle: "À partir de",
      montant: prix,
      suffixe: "/ nuitée",
    };
  }

  if (mensuel != null) {
    return {
      surDemande: false,
      libelle: "Loyer mensuel",
      montant: mensuel,
      suffixe: "/ mois",
    };
  }

  // `prix` porte le tarif journalier partout ailleurs sur la fiche.
  return prix != null
    ? { surDemande: false, libelle: "À partir de", montant: prix, suffixe: "/ nuitée" }
    : { surDemande: true, libelle: "Prix" };
}

/**
 * Le montant seul, sans périodicité — ou « Sur demande ».
 *
 * Destiné aux emplacements trop étroits pour porter une unité : épingles de
 * carte, vignettes du carrousel, bulle d'aperçu. Ils écrivaient tous
 * `formatNumber(bien.prix || bien.prix_month) + " FCFA"`, et `formatNumber`
 * rend la chaîne vide pour `null` : un bien sans prix affichait un « FCFA »
 * seul, flottant au milieu de la pastille. C'est le « ça fait bizarre » du
 * catalogue, transposé sur la carte.
 */
export function prixCompact(bien: BienPrix | null | undefined): string {
  const prix = prixPrincipal(bien);
  return prix.surDemande
    ? "Sur demande"
    : `${formatNumber(prix.montant)} FCFA`;
}

/**
 * L'unité du prix mis en avant — « / mois », « / nuitée » —, vide quand il n'y
 * a pas de montant. Rend lisibles les gabarits qui affichent le montant et son
 * unité dans deux blocs distincts : c'est là que « Sur demande » se retrouvait
 * suivi d'un « / mois ».
 */
export function prixSuffixe(bien: BienPrix | null | undefined): string {
  const prix = prixPrincipal(bien);
  return prix.surDemande ? "" : prix.suffixe;
}
