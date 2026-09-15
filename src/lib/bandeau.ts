/**
 * Le jeton que l'agence peut poser dans un message ou un lien du bandeau.
 *
 * Il évite de saisir le même numéro à deux endroits. Sans lui, le message
 * « Appelez-nous au +225 01 43 483 131 » figerait le numéro dans la table du
 * bandeau : changer de ligne téléphonique depuis /admin/parametres corrigerait
 * le pied de page, la fiche d'un bien et les liens WhatsApp — mais laisserait
 * l'ancien numéro défiler en haut de chaque page, sans que rien ne le signale.
 */
export const JETON_TELEPHONE = "{telephone}";

/** Ce que le remplacement a besoin de connaître des coordonnées du site. */
export type CoordonneesJetons = {
  phone: string;
  telHref: string;
};

/** Remplace les jetons d'un message par les coordonnées réelles. */
export function texteAvecJetons(
  texte: string,
  contact: CoordonneesJetons,
): string {
  return texte.split(JETON_TELEPHONE).join(contact.phone);
}

/**
 * Résout la destination d'une information.
 *
 * Le jeton seul vaut « appeler l'agence » et devient un `tel:`. Renvoie `null`
 * quand aucune destination n'est saisie : l'appelant rend alors un élément
 * inerte plutôt qu'un lien vers nulle part.
 */
export function lienAvecJetons(
  lien: string | null | undefined,
  contact: CoordonneesJetons,
): string | null {
  const v = lien?.trim();
  if (!v) return null;
  if (v === JETON_TELEPHONE) return contact.telHref;
  return v;
}
