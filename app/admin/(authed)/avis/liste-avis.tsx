"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  EyeOff,
  Home,
  Loader2,
  Mail,
  MessageSquareReply,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  modererAvis,
  repondreAvis,
  supprimerAvis,
  type AvisAdmin,
  type StatutAvis,
} from "@/src/actions/admin/avis";

const STATUT: Record<StatutAvis, { libelle: string; couleur: string }> = {
  en_attente: { libelle: "À relire", couleur: "bg-amber-50 text-amber-700 border-amber-200" },
  publie: { libelle: "Publié", couleur: "bg-green-50 text-green-700 border-green-200" },
  refuse: { libelle: "Refusé", couleur: "bg-red-50 text-red-700 border-red-200" },
};

const dateCourte = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const moisLong = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

export function ListeAvis({ avis }: { avis: AvisAdmin[] }) {
  return (
    <div className="space-y-4">
      {avis.map((a) => (
        <CarteAvis key={a.id} avis={a} />
      ))}
    </div>
  );
}

function CarteAvis({ avis }: { avis: AvisAdmin }) {
  const router = useRouter();
  const [enCours, setEnCours] = React.useState<string | null>(null);
  const [reponseOuverte, setReponseOuverte] = React.useState(false);
  const [reponse, setReponse] = React.useState(avis.reponse ?? "");

  async function executer(cle: string, action: () => Promise<{ ok: boolean; error?: string }>, succes: string) {
    setEnCours(cle);
    const res = await action();
    setEnCours(null);
    if (!res.ok) {
      toast.error(res.error ?? "Action impossible.");
      return;
    }
    toast.success(succes);
    router.refresh();
  }

  async function envoyerReponse() {
    setEnCours("reponse");
    const res = await repondreAvis(avis.id, reponse);
    setEnCours(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.data.envoyee) {
      toast.success(`Réponse enregistrée et envoyée à ${avis.email}.`);
    } else {
      toast.warning(`Réponse enregistrée, mais l'e-mail n'est pas parti : ${res.data.raison}.`);
    }
    setReponseOuverte(false);
    router.refresh();
  }

  const statut = STATUT[avis.statut];

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex" aria-label={`${avis.note} sur 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn("h-4 w-4", n <= avis.note ? "fill-amber-400 text-amber-400" : "text-stone-300")}
                />
              ))}
            </span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", statut.couleur)}>
              {statut.libelle}
            </span>
          </div>
          <p className="font-semibold text-secondary">{avis.nom}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <a href={`mailto:${avis.email}`} className="inline-flex items-center gap-1 hover:text-primary">
              <Mail className="h-3 w-3" />
              {avis.email}
            </a>
            {avis.bien && (
              <Link href={`/properties/${avis.bien.id}`} target="_blank" className="inline-flex items-center gap-1 hover:text-primary">
                <Home className="h-3 w-3" />
                {avis.bien.name ?? "Logement"}
              </Link>
            )}
            {avis.mois_sejour && <span>Séjour : {moisLong(avis.mois_sejour)}</span>}
            <span>Reçu le {dateCourte(avis.created_at)}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {avis.statut !== "publie" && (
            <Button
              size="sm"
              disabled={!!enCours}
              onClick={() => executer("publier", () => modererAvis(avis.id, "publie"), "Avis publié sur la fiche du bien.")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {enCours === "publier" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Publier
            </Button>
          )}
          {avis.statut !== "refuse" && (
            <Button
              size="sm"
              variant="outline"
              disabled={!!enCours}
              onClick={() => executer("refuser", () => modererAvis(avis.id, "refuse"), "Avis refusé : il n'apparaîtra pas sur le site.")}
            >
              <EyeOff className="h-3.5 w-3.5" />
              {avis.statut === "publie" ? "Retirer" : "Refuser"}
            </Button>
          )}
          {avis.statut === "refuse" && (
            <Button
              size="sm"
              variant="outline"
              disabled={!!enCours}
              onClick={() => executer("attente", () => modererAvis(avis.id, "en_attente"), "Avis remis à relire.")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              À relire
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={!!enCours}
            aria-label="Supprimer l'avis"
            onClick={() => {
              if (!confirm("Supprimer définitivement cet avis ? Action irréversible.")) return;
              void executer("supprimer", () => supprimerAvis(avis.id), "Avis supprimé.");
            }}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line rounded-lg bg-stone-50 p-4 text-sm leading-relaxed text-neutral-800">
        {avis.commentaire}
      </p>

      {avis.reponse && !reponseOuverte && (
        <div className="mt-3 rounded-lg border-l-4 border-primary bg-amber-50/60 p-4 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Réponse de l&apos;agence
            <span className="ml-2 font-normal normal-case tracking-normal text-neutral-500">
              {avis.reponse_envoyee_le
                ? `envoyée par e-mail le ${dateCourte(avis.reponse_envoyee_le)}`
                : "pas encore envoyée par e-mail"}
            </span>
          </p>
          <p className="whitespace-pre-line text-neutral-800">{avis.reponse}</p>
        </div>
      )}

      {reponseOuverte ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder={`Bonjour, merci pour votre avis…`}
            className="rounded-lg"
          />
          <p className="text-xs text-neutral-500">
            La réponse est envoyée à {avis.email} et affichée sous l&apos;avis
            s&apos;il est publié.
          </p>
          <div className="flex gap-2">
            <Button size="sm" disabled={!!enCours || reponse.trim().length < 2} onClick={envoyerReponse}>
              {enCours === "reponse" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Enregistrer et envoyer
            </Button>
            <Button size="sm" variant="ghost" disabled={!!enCours} onClick={() => setReponseOuverte(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setReponseOuverte(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <MessageSquareReply className="h-4 w-4" />
          {avis.reponse ? "Modifier et renvoyer la réponse" : "Répondre"}
        </button>
      )}
    </article>
  );
}
