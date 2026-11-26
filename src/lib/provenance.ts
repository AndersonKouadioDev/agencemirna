/**
 * Provenance d'un visiteur : par quel lien suivi (UTM) ou quel site il est
 * arrivé. Jointe à chaque demande, elle apparaît dans /admin/leads et dans
 * l'e-mail de notification : on sait quel canal apporte des clients (fiche
 * Google, WhatsApp, QR code d'une affiche…).
 *
 * Retenue pour la visite en cours seulement (`sessionStorage`), jamais
 * partagée avec un tiers, et pas du tout si le visiteur a refusé les cookies.
 */

import { CLE_CONSENTEMENT } from "@/src/lib/consentement";

export const CLES_PROVENANCE = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  /** Première page vue pendant la visite. */
  "page_arrivee",
  /** Site d'où vient le visiteur (hors agencemirna.com). */
  "site_referent",
] as const;

export type Provenance = Partial<Record<(typeof CLES_PROVENANCE)[number], string>>;

const CLE_STOCKAGE = "mirna_provenance";

/** À appeler une fois à l'arrivée sur le site (voir capture-provenance.tsx). */
export function memoriserProvenance(): void {
  try {
    if (localStorage.getItem(CLE_CONSENTEMENT) === "refuse") return;
    // Premier contact de la visite : les pages suivantes ne l'écrasent pas.
    if (sessionStorage.getItem(CLE_STOCKAGE)) return;

    const params = new URLSearchParams(window.location.search);
    const provenance: Provenance = { page_arrivee: window.location.pathname };
    for (const cle of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
      const valeur = params.get(cle)?.trim();
      if (valeur) provenance[cle] = valeur.slice(0, 120);
    }
    if (document.referrer) {
      const hote = new URL(document.referrer).hostname;
      if (hote && hote !== window.location.hostname) provenance.site_referent = hote;
    }
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(provenance));
  } catch {
    // Stockage indisponible (navigation privée) : la demande partira sans provenance.
  }
}

export function lireProvenance(): Provenance | null {
  try {
    if (localStorage.getItem(CLE_CONSENTEMENT) === "refuse") return null;
    const brut = sessionStorage.getItem(CLE_STOCKAGE);
    return brut ? (JSON.parse(brut) as Provenance) : null;
  } catch {
    return null;
  }
}

/**
 * Nettoyage côté serveur : la provenance vient du navigateur, donc d'une
 * source non fiable. On ne garde que les clés connues, en texte court.
 */
export function nettoyerProvenance(entree: unknown): Provenance {
  if (!entree || typeof entree !== "object") return {};
  const propre: Provenance = {};
  for (const cle of CLES_PROVENANCE) {
    const valeur = (entree as Record<string, unknown>)[cle];
    if (typeof valeur === "string") {
      // Sans caractères de contrôle, et bornée : c'est affiché dans l'admin et dans un e-mail.
      const texte = valeur.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 120);
      if (texte) propre[cle] = texte;
    }
  }
  return propre;
}
