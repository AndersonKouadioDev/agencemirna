"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLead } from "@/src/actions/admin/leads";

export function LeadDelete({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function onDelete() {
    if (
      !confirm(
        "Supprimer définitivement ce lead ? L'action est irréversible. Envisagez plutôt 'Archivé' pour conserver l'historique.",
      )
    )
      return;
    setBusy(true);
    const res = await deleteLead(id);
    setBusy(false);
    if (res.ok) {
      router.push("/admin/leads?flash=deleted");
    } else {
      alert(res.error);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onDelete}
      disabled={busy}
      className="text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
      )}
      Supprimer
    </Button>
  );
}
