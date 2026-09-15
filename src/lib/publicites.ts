/**
 * Publicités : types, emplacements, destination.
 *
 * Les EMPLACEMENTS sont un registre de code, pas une table. Un emplacement est
 * une balise `<EmplacementPub cle="…" />` posée dans une page : la base ne peut
 * pas en créer, et une clé qu'aucune page ne rend ne s'affiche nulle part. Le
 * registre sert trois choses : proposer les clés en admin, dire à quoi
 * ressemble chaque place (large, encart, colonne) pour que le rendu s'y adapte,
 * et refuser une clé inconnue à la saisie.
 */

export const TYPES_PUB = ["image", "texte", "video"] as const;
export type TypePub = (typeof TYPES_PUB)[number];

/**
 * Le format dicte le rendu : un bandeau pleine largeur ne se compose pas comme
 * une colonne étroite. C'est l'emplacement qui le fixe, pas la publicité —
 * une même pub posée ailleurs prend la forme de l'endroit.
 */
export type FormatPub = "bandeau" | "encart" | "aside";

export const EMPLACEMENTS_PUB = [
  { cle: "accueil-haut", libelle: "Accueil — sous le héros", page: "Accueil", format: "bandeau" },
  { cle: "accueil-milieu", libelle: "Accueil — entre biens et communes", page: "Accueil", format: "encart" },
  { cle: "accueil-bas", libelle: "Accueil — avant les témoignages", page: "Accueil", format: "bandeau" },
  { cle: "catalogue-haut", libelle: "Catalogue — au-dessus des biens", page: "Biens", format: "bandeau" },
  { cle: "bien-aside", libelle: "Fiche d'un bien — colonne de droite", page: "Fiche bien", format: "aside" },
  { cle: "bien-bas", libelle: "Fiche d'un bien — avant les biens similaires", page: "Fiche bien", format: "bandeau" },
  { cle: "annonces-haut", libelle: "Annonces — en tête de page", page: "Annonces", format: "bandeau" },
  { cle: "blog-haut", libelle: "Blog — en tête de liste", page: "Blog", format: "bandeau" },
  { cle: "article-bas", libelle: "Article — après le texte", page: "Blog", format: "encart" },
  { cle: "services-haut", libelle: "Services — en tête de page", page: "Services", format: "bandeau" },
  { cle: "contact-haut", libelle: "Contact — en tête de page", page: "Contact", format: "encart" },
] as const satisfies ReadonlyArray<{
  cle: string;
  libelle: string;
  page: string;
  format: FormatPub;
}>;

export type CleEmplacement = (typeof EMPLACEMENTS_PUB)[number]["cle"];

export function emplacementPub(cle: string | null | undefined) {
  return EMPLACEMENTS_PUB.find((e) => e.cle === cle) ?? null;
}

export function cleEmplacementValide(cle: string | null | undefined): boolean {
  return emplacementPub(cle) !== null;
}

/** Ce qu'il faut d'une publicité pour en décider la destination. */
export type PubDestination = {
  lien?: string | null;
  bien?: { id: string } | null;
};

/**
 * Chemin interne ou URL absolue http(s), sinon rien. Même règle que les
 * annonces : un `cta_url` libre part dans un `<Link>`, et « agencemirna.com/x »
 * y devient un chemin relatif vers une 404 ; un `javascript:` serait pire.
 */
function lienSur(url: string | null | undefined): string | null {
  const v = url?.trim();
  if (!v) return null;
  if (v.slice(0, 2).replace(/\\/g, "/").startsWith("//")) return null;
  if (v.startsWith("/")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return null;
}

/** Le lien explicite, sinon la fiche du bien, sinon `null` : pub inerte. */
export function destinationPub(pub: PubDestination): string | null {
  return lienSur(pub.lien) ?? (pub.bien?.id ? `/properties/${pub.bien.id}` : null);
}

export const MESSAGE_LIEN_PUB_INVALIDE =
  "Lien invalide : indiquez un chemin interne (« /properties »), ou une URL " +
  "complète « https://… ». Laissez vide pour mener à la fiche du bien choisi.";
