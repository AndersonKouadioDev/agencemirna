"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regenererLienAvis } from "@/src/actions/admin/avis";

export function ActionsAffiche({ bienId, lien }: { bienId: string; lien: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = React.useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien);
      toast.success("Lien copié : vous pouvez aussi l'envoyer au client par WhatsApp.");
    } catch {
      toast.error("Copie impossible : sélectionnez le lien à la main.");
    }
  }

  async function regenerer() {
    if (
      !confirm(
        "Créer un nouveau lien ? L'ancien QR code cessera de fonctionner : il faudra réimprimer l'affiche.",
      )
    ) {
      return;
    }
    setEnCours(true);
    const res = await regenererLienAvis(bienId);
    setEnCours(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Nouveau lien créé. Réimprimez l'affiche.");
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimer l&apos;affiche
        </Button>
        <Button variant="outline" onClick={copier}>
          <Copy className="h-4 w-4" />
          Copier le lien
        </Button>
        <Button variant="outline" onClick={regenerer} disabled={enCours}>
          <RefreshCw className={enCours ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Nouveau lien
        </Button>
      </div>
      <p className="break-all rounded-lg bg-stone-100 px-3 py-2 font-mono text-xs text-neutral-600">
        {lien}
      </p>
    </div>
  );
}
