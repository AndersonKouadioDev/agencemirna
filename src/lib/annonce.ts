import type { PublicAnnonce } from "@/src/actions/public";

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
export function annonceHref(a: PublicAnnonce): string {
  const lien = lienSur(a.cta_url);
  if (lien) return lien;
  if (a.bien?.id) return `/properties/${a.bien.id}`;
  return "/annonces";
}
