"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Bandeau de confirmation de la page « Communes & quartiers ».
 *
 * Il sert les DEUX entités depuis la fusion des deux listes : les libellés
 * sont donc neutres, faute de quoi enregistrer un quartier annonçait
 * « Commune enregistrée ». Et le nettoyage de la query string vise
 * /admin/geographie : /admin/communes ne contient plus qu'un redirect, si
 * bien que fermer le bandeau coûtait un aller-retour serveur inutile.
 */
const MESSAGES: Record<string, string> = {
  created: "Enregistrement créé.",
  saved: "Modification enregistrée.",
  updated: "Modification enregistrée.",
  deleted: "Suppression effectuée.",
};

const ROUTE = "/admin/geographie";

export function FlashBanner({ type }: { type: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);
  const message = MESSAGES[type];

  // On retire `flash` SANS réécrire l'URL en dur : un filtre ou une page
  // posés pendant les quatre secondes d'affichage du bandeau étaient effacés
  // par le retour à l'adresse nue.
  const nettoyer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const qs = params.toString();
    router.replace(qs ? `${ROUTE}?${qs}` : ROUTE, {
      scroll: false,
    });
  }, [router, searchParams]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      nettoyer();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, nettoyer]);

  if (!visible || !message) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm text-green-800">{message}</span>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          nettoyer();
        }}
        className="rounded p-1 text-green-700 hover:bg-green-100"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
