/**
 * Liens suivis (UTM) par canal, pour savoir d'où viennent les visiteurs et
 * les demandes : Google Analytics lit ces paramètres tout seul, et la
 * provenance est jointe à chaque lead (voir src/lib/provenance.ts).
 *
 * Les valeurs sont fixées ici une fois pour toutes : un même canal écrit de
 * trois façons (« WhatsApp », « whatsapp », « wa ») ferait trois lignes dans
 * les rapports.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

export type Canal = {
  cle: string;
  libelle: string;
  /** Où coller le lien ou poser le QR code. */
  usage: string;
  source: string;
  medium: string;
  /** Le canal s'utilise surtout imprimé, par QR code. */
  qr: boolean;
};

export const CANAUX: Canal[] = [
  {
    cle: "fiche-google",
    libelle: "Fiche Google Business",
    usage: "Champ « Site web » de la fiche et bouton des posts.",
    source: "google",
    medium: "organic",
    qr: false,
  },
  {
    cle: "whatsapp",
    libelle: "WhatsApp",
    usage: "Statuts, listes de diffusion et messages aux clients.",
    source: "whatsapp",
    medium: "social",
    qr: false,
  },
  {
    cle: "email",
    libelle: "Signature d'e-mail",
    usage: "Lien du site dans la signature des e-mails de l'équipe.",
    source: "signature",
    medium: "email",
    qr: false,
  },
  {
    cle: "carte-visite",
    libelle: "Carte de visite",
    usage: "QR code imprimé sur les cartes de visite.",
    source: "carte-visite",
    medium: "qr",
    qr: true,
  },
  {
    cle: "affiche",
    libelle: "Affiche, flyer, panneau",
    usage: "QR code sur une affiche de logement, un flyer ou un panneau « À louer ».",
    source: "affiche",
    medium: "qr",
    qr: true,
  },
];

/** « Kayser 2P7 » → « kayser-2p7 » : nom de campagne lisible dans les rapports. */
export function slugCampagne(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function construireLienSuivi(chemin: string, canal: Canal, campagne: string): string {
  const url = new URL(chemin.startsWith("/") ? chemin : `/${chemin}`, SITE_URL);
  url.searchParams.set("utm_source", canal.source);
  url.searchParams.set("utm_medium", canal.medium);
  url.searchParams.set("utm_campaign", slugCampagne(campagne) || canal.cle);
  return url.toString();
}
