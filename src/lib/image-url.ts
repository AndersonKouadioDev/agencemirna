/**
 * Garde-fou partagé sur les adresses d'images saisies à la main en back-office.
 *
 * next/image ne se contente pas d'ignorer un hôte inconnu : il LÈVE pendant le
 * rendu, ce qui fait tomber la page entière — vitrine comprise. Une adresse
 * doit donc être refusée à la saisie, jamais découverte à l'affichage.
 *
 * CE MODULE EST LA VERSION DE RÉFÉRENCE. La même logique vit encore en double
 * dans app/admin/(authed)/taxonomie/taxonomy-manager.tsx (hors périmètre de
 * cette passe), mais cette copie-là est en retard sur deux points : elle laisse
 * passer « //hote » et « /\hote », et sa signature n'accepte qu'une `string`.
 * Les deux écarts vont dans le même sens : brancher taxonomy-manager.tsx sur
 * `@/src/lib/image-url` et supprimer sa copie est un remplacement strict, sans
 * régression de typage ni de comportement.
 */

/**
 * Hôtes acceptés par next/image, avec le préfixe de chemin que chacun impose
 * dans les `remotePatterns` de next.config.mjs. Contrôler l'hôte seul ne suffit
 * pas : next/image lève aussi quand le chemin sort du motif déclaré.
 */
export const HOTES_IMAGES_AUTORISES = [
  {
    // L'URL Supabase peut porter un « / » final : on ne garde que l'hôte.
    hote: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, ""),
    prefixe: "/storage/",
  },
  { hote: "i.ytimg.com", prefixe: "/vi/" },
  { hote: "images.unsplash.com", prefixe: "/" },
].filter((h) => h.hote);

export const MESSAGE_URL_IMAGE_INVALIDE =
  "Adresse d'image invalide : indiquez un chemin interne (commençant par /) " +
  "ou une URL https servie par " +
  HOTES_IMAGES_AUTORISES.map((h) => h.hote + h.prefixe).join(", ") +
  ".";

/**
 * Renvoie l'URL à stocker, `null` pour un champ vidé, ou `undefined` si la
 * saisie n'est pas exploitable par next/image.
 */
export function normaliserUrlImage(
  saisie: string | null | undefined,
): string | null | undefined {
  const valeur = (saisie ?? "").trim();
  if (!valeur) return null;
  // « //exemple.com » est une URL absolue déguisée en chemin, et l'antislash
  // vaut un slash dans la résolution d'URL des navigateurs : ni l'un ni l'autre
  // ne désigne une image du site.
  if (valeur.slice(0, 2).replace(/\\/g, "/") === "//") return undefined;
  if (valeur.startsWith("/")) return valeur;
  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:") return undefined;
  const autorise = HOTES_IMAGES_AUTORISES.find((h) => h.hote === url.hostname);
  return autorise && url.pathname.startsWith(autorise.prefixe)
    ? valeur
    : undefined;
}
