"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Bandeau de confirmation propre à la section Leads.
 *
 * Chaque section admin a le sien parce que le libellé ET le chemin de
 * nettoyage du paramètre `?flash=` lui sont propres : réutiliser celui des
 * annonces afficherait « Promotion supprimée. » puis quitterait /admin/leads.
 */
const MESSAGES: Record<string, string> = {
  saved: "Lead enregistré.",
  updated: "Lead mis à jour.",
  deleted: "Lead supprimé.",
};

export function FlashBanner({ type }: { type: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);
  const message = MESSAGES[type];

  // On retire `flash` SANS réécrire l'URL en dur : un filtre posé pendant les
  // quatre secondes d'affichage du bandeau était effacé par le retour à
  // « /admin/leads », alors que la liste venait d'être filtrée.
  const nettoyer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const qs = params.toString();
    router.replace(qs ? `/admin/leads?${qs}` : "/admin/leads", {
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
