import { sendGAEvent } from "@next/third-parties/google";

/**
 * Événements de conversion envoyés à Google Analytics 4.
 *
 * GA4 est chargé directement par le layout (`<GoogleAnalytics>`), et le
 * conteneur GTM n'a pas de balise GA4 : on envoie donc les événements par gtag.
 * Si GA4 passe un jour dans GTM, il suffira de changer ce seul module.
 *
 * Noms d'événements recommandés par GA4, pour que les rapports les
 * reconnaissent : `generate_lead`, `sign_up`, `share`. Dans GA4, marquer
 * `generate_lead` et `contact_whatsapp` comme « événements clés ».
 *
 * Aucun appel ne doit faire échouer un parcours : sans GA (bloqueur de
 * publicité, consentement refusé), l'envoi est simplement ignoré.
 */

type Parametres = Record<string, string | number | null | undefined>;

function envoyer(evenement: string, parametres: Parametres = {}) {
  if (typeof window === "undefined") return;
  try {
    sendGAEvent("event", evenement, {
      page_path: window.location.pathname,
      ...parametres,
    });
  } catch {
    // Mesure d'audience : jamais bloquante.
  }
}

/** Origine d'une demande, telle qu'enregistrée dans l'admin (Leads). */
export type SourceDemande =
  | "contact_bien"
  | "demande_visite"
  | "contact"
  | "estimation";

/** Une demande envoyée avec succès depuis un formulaire du site. */
export function suivreDemande(source: SourceDemande, parametres: Parametres = {}) {
  envoyer("generate_lead", { lead_source: source, ...parametres });
}

export function suivreInscriptionNewsletter() {
  envoyer("sign_up", { method: "newsletter" });
}

/** Clic sur un lien WhatsApp, téléphone ou e-mail. */
export function suivreContact(canal: "whatsapp" | "telephone" | "email", lien: string) {
  envoyer(`contact_${canal}`, { link_url: lien });
}

export function suivrePartage(methode: string, nomDuBien?: string | null) {
  envoyer("share", { method: methode, content_type: "bien", item_id: nomDuBien ?? undefined });
}
