import type { PublicAnnonce } from "@/src/actions/public";

/**
 * Lien de destination d'une annonce : le bien mis en avant, sauf lien explicite.
 *
 * NB : ce helper vit hors de `src/actions/public.ts`, qui porte la directive
 * `"use server"` et n'accepte donc que des exports async.
 */
export function annonceHref(a: PublicAnnonce): string {
  if (a.cta_url && a.cta_url.trim()) return a.cta_url.trim();
  if (a.bien?.id) return `/properties/${a.bien.id}`;
  return "/annonces";
}
