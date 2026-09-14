"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Bandeau propre aux communes. La page réutilisait celui des annonces, qui
 * annonce « Promotion enregistrée. » puis renvoie sur /admin/annonces au bout
 * de quatre secondes : l'admin était éjecté de sa liste de communes.
 */
const MESSAGES: Record<string, string> = {
  created: "Commune créée.",
  saved: "Commune enregistrée.",
  updated: "Commune mise à jour.",
  deleted: "Commune supprimée.",
};

export function FlashBanner({ type }: { type: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const message = MESSAGES[type];

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/admin/communes", { scroll: false });
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, router]);

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
          router.replace("/admin/communes", { scroll: false });
        }}
        className="rounded p-1 text-green-700 hover:bg-green-100"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
