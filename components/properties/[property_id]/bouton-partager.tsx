"use client";

import { Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { suivrePartage } from "@/src/lib/suivi";

/**
 * Partager une fiche bien : chaque visiteur peut la transmettre à un proche.
 *
 * Sur téléphone, le menu de partage du système (WhatsApp, SMS, e-mail…) ;
 * ailleurs, un message WhatsApp pré-rempli. « Copier le lien » couvre le reste.
 */
export function BoutonPartager({ nom }: { nom?: string | null }) {
  async function partager() {
    const url = window.location.href;
    const titre = nom ? `${nom} : Agence Mirna` : document.title;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titre, url });
        suivrePartage("natif", nom);
      } catch {
        // Partage annulé par le visiteur : rien à signaler.
      }
      return;
    }
    suivrePartage("whatsapp", nom);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${titre}\n${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié");
      suivrePartage("copie", nom);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  }

  const style =
    "inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={partager} className={style}>
        <Share2 className="h-4 w-4" /> Partager
      </button>
      <button type="button" onClick={copier} className={style}>
        <Link2 className="h-4 w-4" /> Copier le lien
      </button>
    </div>
  );
}
