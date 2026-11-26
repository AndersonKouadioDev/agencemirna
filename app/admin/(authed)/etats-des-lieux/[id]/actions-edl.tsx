"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDown, LogOut, Loader2, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { envoyerEdlParEmail, supprimerEdl } from "@/src/actions/admin/etats-des-lieux";
import type { EtatDesLieux } from "@/src/lib/etat-des-lieux";

export function ActionsEdl({ edl }: { edl: EtatDesLieux }) {
  const router = useRouter();
  const [enCours, setEnCours] = React.useState<"envoi" | "suppression" | null>(null);
  const destinataires = [edl.locataire_email, edl.proprietaire_email].filter(Boolean);

  async function envoyer() {
    if (
      !confirm(
        `Envoyer le PDF à ${destinataires.join(" et ")} ?${edl.envoye_le ? " (il a déjà été envoyé une fois)" : ""}`,
      )
    ) {
      return;
    }
    setEnCours("envoi");
    const res = await envoyerEdlParEmail(edl.id);
    setEnCours(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`PDF envoyé à ${res.data.destinataires.join(" et ")}.`);
    router.refresh();
  }

  async function supprimer() {
    if (!confirm("Supprimer définitivement cet état des lieux, ses photos et ses signatures ? Action irréversible.")) {
      return;
    }
    setEnCours("suppression");
    const res = await supprimerEdl(edl.id);
    if (!res.ok) {
      setEnCours(null);
      toast.error(res.error);
      return;
    }
    toast.success("État des lieux supprimé.");
    router.push("/admin/etats-des-lieux");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <a href={`/admin/etats-des-lieux/${edl.id}/pdf`} target="_blank" rel="noopener noreferrer">
          <FileDown className="h-4 w-4" />
          Télécharger le PDF
        </a>
      </Button>
      <Button
        variant="outline"
        onClick={envoyer}
        disabled={!!enCours || destinataires.length === 0}
        title={destinataires.length === 0 ? "Aucune adresse e-mail renseignée" : undefined}
      >
        {enCours === "envoi" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {edl.envoye_le ? "Renvoyer par e-mail" : "Envoyer par e-mail"}
      </Button>
      {edl.type === "entree" && (
        <Button variant="outline" asChild>
          <Link href={`/admin/etats-des-lieux/nouveau?bien=${edl.bien_id}&entree=${edl.id}`}>
            <LogOut className="h-4 w-4" />
            Faire l&apos;état des lieux de sortie
          </Link>
        </Button>
      )}
      <Button
        variant="outline"
        onClick={supprimer}
        disabled={!!enCours}
        className="hover:bg-red-50 hover:text-red-600"
        aria-label="Supprimer l'état des lieux"
      >
        {enCours === "suppression" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
