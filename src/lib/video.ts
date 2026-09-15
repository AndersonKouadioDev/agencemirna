/**
 * Reconnaissance d'une adresse de vidéo saisie en back-office.
 *
 * Le champ est libre : un rédacteur y colle ce que son navigateur lui a donné.
 * Ce module ramène cette diversité à trois cas lisibles, et REFUSE tout le
 * reste plutôt que de laisser une adresse inconnue atteindre un `<iframe>` ou
 * un `<video>` — un `javascript:` y serait une faille, un `data:` aussi.
 *
 * Les formes acceptées sont celles qu'on obtient réellement en partageant une
 * vidéo : le lien de la barre d'adresse, le lien court, le lien d'une story,
 * le code d'intégration, le lien d'une diffusion. La logique YouTube vient de
 * `PropertyVideo`, qui la portait seule ; les deux surfaces s'en servent
 * désormais, et une visite de bien gagne au passage Vimeo et le fichier direct.
 */

export type SourceVideo = {
  fournisseur: "youtube" | "vimeo" | "fichier";
  /** À placer dans un `<iframe src>`. `null` pour un fichier. */
  integration: string | null;
  /** À placer dans un `<video src>`. `null` pour un lecteur embarqué. */
  fichier: string | null;
  /** Affiche proposée par le fournisseur, quand il en publie une. */
  miniature: string | null;
};

/** Extensions lues nativement par les navigateurs. */
const EXTENSIONS_FICHIER = /\.(mp4|webm|ogv|ogg|mov|m4v)$/i;

/**
 * Forme d'un identifiant de vidéo, chez YouTube comme chez Vimeo.
 *
 * Ce contrôle n'est pas cosmétique. L'identifiant est recopié dans l'adresse de
 * la miniature — `https://i.ytimg.com/vi/<id>/hqdefault.jpg` — qui part ensuite
 * dans next/image. Or `encodeURIComponent` n'encode PAS le point : un lien
 * « ?v=.. » produisait `/vi/../hqdefault.jpg`, que `new URL()` normalise en
 * `/hqdefault.jpg`. L'adresse sortait du motif `/vi/**` déclaré dans
 * next.config.mjs, et next/image ne se contente pas d'ignorer un chemin hors
 * motif : il LÈVE pendant le rendu, donc la page entière tombe.
 *
 * Un identifiant YouTube fait onze caractères de cet alphabet, un identifiant
 * Vimeo est numérique. Rien de ce qui sort d'ici ne peut plus remonter un
 * chemin ni s'échapper d'un segment d'URL.
 */
const ID_VALIDE = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Identifiant YouTube.
 *
 * `?v=` couvre le lien de la barre d'adresse. Les liens partagés depuis
 * l'application mobile, une story, une diffusion ou un code d'intégration n'ont
 * pas ce paramètre : l'identifiant est alors le segment qui suit /shorts/,
 * /embed/, /live/ ou /v/.
 */
function idYoutube(url: URL): string | null {
  const retenir = (brut: string | null | undefined): string | null =>
    brut && ID_VALIDE.test(brut) ? brut : null;

  if (/(^|\.)youtube(-nocookie)?\.com$/i.test(url.hostname)) {
    const v = url.searchParams.get("v");
    if (v) return retenir(v);
    return retenir(
      url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1],
    );
  }
  if (/(^|\.)youtu\.be$/i.test(url.hostname)) {
    // `slice(1)` gardait les segments suivants d'un lien de playlist.
    return retenir(url.pathname.split("/").filter(Boolean)[0]);
  }
  return null;
}

/**
 * Identifiant Vimeo, et le jeton des vidéos non répertoriées.
 *
 * Une vidéo « non répertoriée » ne s'intègre qu'accompagnée de son jeton : sans
 * lui, le lecteur affiche « Sorry, this video does not exist ». Le jeton est le
 * segment qui suit l'identifiant dans le lien partagé.
 */
function idVimeo(url: URL): { id: string; jeton: string | null } | null {
  if (!/(^|\.)vimeo\.com$/i.test(url.hostname)) return null;
  const segments = url.pathname.split("/").filter(Boolean);
  const i = segments.findIndex((s) => /^\d+$/.test(s));
  if (i === -1) return null;
  const suivant = segments[i + 1];
  const brut = url.searchParams.get("h") ?? suivant ?? null;
  const jeton = brut && ID_VALIDE.test(brut) ? brut : null;
  return { id: segments[i], jeton };
}

/**
 * Analyse une adresse, ou `null` si elle n'est pas une vidéo lisible.
 *
 * Un chemin interne (« /videos/visite.mp4 ») est accepté : il désigne un
 * fichier du site. Une adresse absolue doit être en https — le site l'est, et
 * un média en http serait bloqué comme contenu mixte, donc invisible sans le
 * moindre message.
 */
export function analyserVideo(
  adresse: string | null | undefined,
): SourceVideo | null {
  const valeur = (adresse ?? "").trim();
  if (!valeur) return null;

  // Les navigateurs RETIRENT tabulations et sauts de ligne d'une URL avant de
  // la résoudre : « /<tab>/evil.com/x.mp4 » ne ressemble pas à un chemin
  // absolu-réseau ici, mais en devient un une fois posé dans un `src`. On
  // refuse donc toute adresse qui en contient, plutôt que d'essayer de la
  // nettoyer — il n'y a aucune raison légitime d'en trouver dans une URL.
  if (/[\u0000-\u001F\u007F]/.test(valeur)) return null;

  // « //hote/x » est une URL absolue déguisée en chemin, et l'antislash vaut un
  // slash dans la résolution d'URL des navigateurs.
  if (valeur.slice(0, 2).replace(/\\/g, "/") === "//") return null;

  if (valeur.startsWith("/")) {
    // Chemin interne : seul un fichier lisible a du sens ici.
    const sansRequete = valeur.split(/[?#]/)[0];
    return EXTENSIONS_FICHIER.test(sansRequete)
      ? { fournisseur: "fichier", integration: null, fichier: valeur, miniature: null }
      : null;
  }

  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  // YouTube et Vimeo : le protocole saisi n'a aucune importance, l'adresse
  // d'intégration est reconstruite en https plus bas. Refuser un vieux lien en
  // http ferait disparaître la vidéo de la fiche sans le moindre message.
  const youtube = idYoutube(url);
  if (youtube) {
    return {
      fournisseur: "youtube",
      // `-nocookie` ne dépose rien tant que la lecture n'a pas commencé, et
      // rend exactement le même lecteur.
      integration: `https://www.youtube-nocookie.com/embed/${youtube}`,
      fichier: null,
      // `ID_VALIDE` garantit qu'aucun point ni slash n'entre ici : l'adresse
      // reste sous `/vi/`, le motif déclaré dans next.config.mjs, et next/image
      // ne lèvera pas. L'encodage ne suffisait pas — il laisse passer le point.
      miniature: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`,
    };
  }

  const vimeo = idVimeo(url);
  if (vimeo) {
    const jeton = vimeo.jeton ? `?h=${vimeo.jeton}` : "";
    return {
      fournisseur: "vimeo",
      integration: `https://player.vimeo.com/video/${vimeo.id}${jeton}`,
      fichier: null,
      // Vimeo n'expose pas d'affiche à adresse devinable : elle passe par son
      // API. On se contente de l'affiche saisie en admin.
      miniature: null,
    };
  }

  // Un fichier direct, lui, est servi tel quel : en http il serait bloqué comme
  // contenu mixte par le navigateur, donc invisible et sans explication.
  if (url.protocol === "https:" && EXTENSIONS_FICHIER.test(url.pathname)) {
    return { fournisseur: "fichier", integration: null, fichier: valeur, miniature: null };
  }

  return null;
}

/** `true` si l'adresse donnera quelque chose à regarder. */
export function videoLisible(adresse: string | null | undefined): boolean {
  return analyserVideo(adresse) !== null;
}

export const MESSAGE_URL_VIDEO_INVALIDE =
  "Adresse de vidéo non reconnue. Collez un lien YouTube (youtube.com ou " +
  "youtu.be), un lien Vimeo, ou l'adresse https d'un fichier .mp4 / .webm.";

/**
 * Adresse d'intégration prête à poser dans un `<iframe>`.
 *
 * Les paramètres sont ajoutés ici et non dans `analyserVideo` : la même source
 * sert une affiche inerte et une lecture lancée par le visiteur.
 */
export function urlIntegration(
  source: SourceVideo,
  options?: { lectureAutomatique?: boolean },
): string | null {
  if (!source.integration) return null;
  const url = new URL(source.integration);
  if (options?.lectureAutomatique) {
    url.searchParams.set("autoplay", "1");
  }
  if (source.fournisseur === "youtube") {
    // Sans `rel=0`, YouTube propose à la fin les vidéos d'autres chaînes —
    // y compris celles d'agences concurrentes, sur notre propre page.
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
  }
  return url.toString();
}
