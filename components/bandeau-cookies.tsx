"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CLE_CONSENTEMENT,
  ETAT_ACCEPTE,
  ETAT_REFUSE,
  type ChoixConsentement,
} from "@/src/lib/consentement";

/**
 * Bandeau de consentement aux cookies de mesure d'audience.
 *
 * Il ne s'affiche qu'une fois : le choix est retenu dans le navigateur et
 * réappliqué à chaque visite par le script de `consentement.ts`. Le bouton
 * « Refuser » vaut autant que « Accepter » : c'est ce que demandent Google et
 * la réglementation.
 */
export function BandeauCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lu après le premier rendu : le serveur ne connaît pas le choix stocké
    // dans le navigateur, l'afficher d'emblée provoquerait un écart d'hydratation.
    let dejaChoisi = false;
    try {
      dejaChoisi = localStorage.getItem(CLE_CONSENTEMENT) != null;
    } catch {
      // Stockage indisponible (navigation privée stricte) : on demande.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dejaChoisi) setVisible(true);
  }, []);

  function choisir(choix: ChoixConsentement) {
    try {
      localStorage.setItem(CLE_CONSENTEMENT, choix);
    } catch {
      // Le choix vaut pour cette visite même s'il ne peut pas être retenu.
    }
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("consent", "update", choix === "accepte" ? ETAT_ACCEPTE : ETAT_REFUSE);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl md:inset-x-6 md:bottom-6 md:flex md:items-center md:gap-6 md:p-5"
    >
      <p className="text-sm leading-relaxed text-stone-600">
        Nous utilisons des cookies de mesure d&apos;audience (Google Analytics)
        pour comprendre comment le site est utilisé et l&apos;améliorer.{" "}
        <Link href="/confidentialite" className="font-semibold text-secondary underline underline-offset-2">
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
        <button
          type="button"
          onClick={() => choisir("refuse")}
          className="flex-1 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-secondary hover:bg-stone-50 md:flex-none"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => choisir("accepte")}
          className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 md:flex-none"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
