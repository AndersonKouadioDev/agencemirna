/**
 * Consentement aux cookies (Google Consent Mode v2).
 *
 * Google exige le consentement avant toute mesure ou publicité ciblée pour les
 * visiteurs de l'Espace économique européen, du Royaume-Uni et de la Suisse —
 * la diaspora et les expatriés en font partie. Pour eux, tout est refusé par
 * défaut jusqu'à ce qu'ils acceptent ; ailleurs, la mesure est active et le
 * visiteur peut la refuser depuis le bandeau. La loi ivoirienne 2013-450
 * (ARTCI) demande, elle aussi, d'informer et de laisser le choix.
 */

/** Clé de `localStorage` où le choix du visiteur est retenu. */
export const CLE_CONSENTEMENT = "mirna_consentement";

export type ChoixConsentement = "accepte" | "refuse";

const REGIONS_CONSENTEMENT_REQUIS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "GB", "CH",
];

export const ETAT_ACCEPTE = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

export const ETAT_REFUSE = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

/**
 * Exécuté avant GA4 et GTM (`strategy="beforeInteractive"`) : les valeurs par
 * défaut doivent exister avant le premier envoi. Réapplique aussi le choix déjà
 * fait lors d'une visite précédente.
 */
export const SCRIPT_CONSENTEMENT_DEFAUT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', Object.assign({ region: ${JSON.stringify(REGIONS_CONSENTEMENT_REQUIS)}, wait_for_update: 500 }, ${JSON.stringify(ETAT_REFUSE)}));
gtag('consent', 'default', ${JSON.stringify(ETAT_ACCEPTE)});
try {
  var choix = localStorage.getItem(${JSON.stringify(CLE_CONSENTEMENT)});
  if (choix === 'accepte') gtag('consent', 'update', ${JSON.stringify(ETAT_ACCEPTE)});
  if (choix === 'refuse') gtag('consent', 'update', ${JSON.stringify(ETAT_REFUSE)});
} catch (e) {}
`;
