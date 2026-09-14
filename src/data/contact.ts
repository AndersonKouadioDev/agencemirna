/**
 * Coordonnées de repli de l'agence.
 *
 * Module sans « server-only » ni accès base : les pages éditoriales figées
 * (services, mentions légales) s'en servent directement, ce qui leur évite
 * d'attendre `site_settings` et donc de devenir dynamiques.
 *
 * Les pages qui doivent refléter le réglage du back-office passent, elles,
 * par `getSiteContact()` de src/lib/site-contact.ts.
 */
export const DEFAULT_SITE_CONTACT = {
  phone: "+225 01 43 483 131",
  phones: [
    "(+225) 27 21 536 231",
    "(+225) 01 43 483 131",
    "(+225) 07 03 06 42 06",
  ],
  // 225 + les 10 chiffres du numéro affiché. L'ancienne valeur en comptait
  // 11, ce qui rendait tous les liens wa.me du site inopérants.
  whatsapp: "2250143483131",
  email: "info@agencemirna.com",
  facebook: "https://facebook.com/agencemirna",
  instagram: "https://instagram.com/agencemirna",
  linkedin: "https://linkedin.com/company/agencemirna",
};

/** 225 + les 10 chiffres du numéro : lien wa.me prêt à l'emploi. */
export const WHATSAPP_URL_PAR_DEFAUT = `https://wa.me/${DEFAULT_SITE_CONTACT.whatsapp}`;
