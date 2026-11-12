"use client";

import { useEffect } from "react";
import { suivreContact } from "@/src/lib/suivi";

/**
 * Mesure les clics sur les liens WhatsApp, téléphone et e-mail de tout le site.
 *
 * Ces liens sont répartis dans une quinzaine de composants (accueil, fiche
 * bien, pied de page, FAQ, bouton flottant…) : un seul écouteur sur le
 * document les couvre tous, y compris ceux ajoutés plus tard, sans toucher à
 * chaque composant. L'admin n'est pas mesuré.
 */
export function SuiviClics() {
  useEffect(() => {
    function auClic(e: MouseEvent) {
      if (window.location.pathname.startsWith("/admin")) return;
      const lien = (e.target as Element | null)?.closest?.("a[href]");
      if (!(lien instanceof HTMLAnchorElement)) return;
      const href = lien.href;
      if (/wa\.me|whatsapp\.com/i.test(href)) suivreContact("whatsapp", href);
      else if (href.startsWith("tel:")) suivreContact("telephone", href);
      else if (href.startsWith("mailto:")) suivreContact("email", href);
    }
    // Phase de capture : un composant qui arrête la propagation ne fait pas
    // disparaître le clic de la mesure.
    document.addEventListener("click", auClic, true);
    return () => document.removeEventListener("click", auClic, true);
  }, []);

  return null;
}
