import type { PublicAnnonce } from "@/src/actions/public";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { videoLisible } from "@/src/lib/video";

/**
 * Un `cta_url` saisi en admin n'est contraint par rien : le champ « Lien
 * personnalisé » est un input libre et l'action ne le valide pas. Or il part
 * tel quel dans un `<Link>` next/link. Une saisie du genre
 * « agencemirna.com/promo » serait alors résolue comme un chemin RELATIF à la
 * page courante et produirait un 404 ; un `javascript:` serait pire. On
 * n'accepte donc qu'un chemin interne ou une URL absolue http(s), et on
 * retombe sinon sur la destination dérivée du bien.
 */
function lienSur(url: string | null | undefined): string | null {
  const v = url?.trim();
  if (!v) return null;
  // `//exemple.com` est une URL absolue déguisée en chemin : hors du site.
  // L'antislash vaut un slash dans la résolution d'URL des navigateurs, donc
  // `/\exemple.com` sort du site exactement comme `//exemple.com`.
  if (v.slice(0, 2).replace(/\\/g, "/").startsWith("//")) return null;
  if (v.startsWith("/")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return null;
}

/**
 * Lien de destination d'une annonce : le bien mis en avant, sauf lien explicite.
 *
 * NB : ce helper vit hors de `src/actions/public.ts`, qui porte la directive
 * `"use server"` et n'accepte donc que des exports async.
 */
export function annonceHref(a: PublicAnnonce): string | null {
  const lien = lienSur(a.cta_url);
  if (lien) return lien;
  if (a.bien?.id) return `/properties/${a.bien.id}`;
  // Ni bien rattaché ni lien valide : il n'y a aucune destination. Renvoyer
  // « /annonces » rendait la carte cliquable vers la page d'où l'on venait ;
  // l'appelant rend maintenant une carte inerte.
  return null;
}

/**
 * Ce que la carte d'une annonce doit montrer : une vidéo, une image, ou rien.
 *
 * La règle était écrite dans la carte, en une ligne — `annonce.image ||
 * bien.image` — et la fiche du bien va maintenant lire la même chose. Deux
 * copies auraient divergé au premier ajustement.
 *
 * L'affiche d'une vidéo suit le même repli que l'image : le visuel propre à
 * l'annonce d'abord, la photo du bien ensuite. Sans affiche, le lecteur montre
 * la miniature du fournisseur quand il en publie une, un aplat sinon — jamais
 * un cadre noir.
 */
export type MediaAnnonce =
  | { type: "video"; url: string; affiche: string | null }
  | { type: "image"; url: string }
  | null;

export function mediaAnnonce(a: PublicAnnonce): MediaAnnonce {
  // `normaliserUrlImage` renvoie `undefined` pour une adresse que next/image
  // ferait lever : on la traite comme une absence plutôt que de la propager.
  const rendable = (url: string | null | undefined): string | null => {
    const v = normaliserUrlImage(url);
    return typeof v === "string" ? v : null;
  };
  const visuel = rendable(a.image) ?? rendable(a.bien?.image);

  if (a.media_type === "video" && videoLisible(a.video_url)) {
    return { type: "video", url: a.video_url!.trim(), affiche: visuel };
  }

  return visuel ? { type: "image", url: visuel } : null;
}
