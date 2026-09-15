/**
 * Nature commerciale d'un bien : vente ou location, meublé ou non.
 *
 * Ces deux questions pilotent l'affichage du prix, sa périodicité, et la
 * présence du sélecteur de dates sur la fiche. Elles étaient jusqu'ici
 * tranchées en cherchant « vente » ou « meublé » dans le LIBELLÉ du service
 * ou de la catégorie — donc renommer une entrée depuis /admin/taxonomie
 * cassait l'affichage, en silence. La logique était en outre recopiée à
 * l'identique dans cinq composants, avec déjà une divergence entre eux.
 *
 * La migration 0020 porte la décision dans des colonnes explicites. Les
 * libellés redeviennent de simples étiquettes, librement modifiables.
 *
 * Le repli sur le libellé est conservé, et c'est délibéré : il couvre la
 * fenêtre où la migration n'est pas encore appliquée, et le cas d'une
 * catégorie créée sans que la case soit cochée.
 */

type Nommee = { name?: string | null; est_vente?: boolean | null; est_meuble?: boolean | null };

export type BienNature = {
  services_bien?: Nommee | null;
  categories_bien?: Nommee | null;
};

const sansAccent = (v: string | null | undefined) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Le bien est-il à vendre ? Le prix s'affiche alors sans périodicité. */
export function estVente(bien: BienNature | null | undefined): boolean {
  const service = bien?.services_bien;
  if (service?.est_vente != null) return service.est_vente;
  return sansAccent(service?.name).includes("vente");
}

/**
 * Le bien est-il meublé ? Tarif à la nuitée et sélecteur de dates.
 *
 * L'ameublement est une propriété du bien, pas de l'offre : la catégorie
 * tranche donc seule dès qu'elle est renseignée. Ce n'est qu'à défaut que la
 * nature du service est consultée — sans quoi une catégorie « Non meublé »
 * serait annulée par un service nommé « Location meublée ».
 */
export function estMeuble(bien: BienNature | null | undefined): boolean {
  const categorie = bien?.categories_bien;
  if (categorie?.est_meuble != null) return categorie.est_meuble;

  if (categorie?.name) {
    const n = sansAccent(categorie.name);
    if (n.includes("meuble")) return !n.includes("non meuble");
  }

  const service = bien?.services_bien;
  if (service?.est_meuble != null) return service.est_meuble;

  const s = sansAccent(service?.name);
  return s.includes("meuble") || s.includes("courte") || s.includes("vacance");
}
