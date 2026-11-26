"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  creerEdl,
  listEntreesSignees,
  type BienEdl,
  type ResumeEdl,
} from "@/src/actions/admin/etats-des-lieux";
import { dateLongue, type TypeEdl } from "@/src/lib/etat-des-lieux";

export function CreationEdl({
  biens,
  bienInitial,
  entreeInitiale,
}: {
  biens: BienEdl[];
  bienInitial: string;
  entreeInitiale: string;
}) {
  const router = useRouter();
  const [bienId, setBienId] = React.useState(bienInitial);
  const [type, setType] = React.useState<TypeEdl>(entreeInitiale ? "sortie" : "entree");
  const [entrees, setEntrees] = React.useState<ResumeEdl[]>([]);
  const [entreeId, setEntreeId] = React.useState(entreeInitiale);
  const [chargement, setChargement] = React.useState(false);
  const [creation, setCreation] = React.useState(false);

  // Une sortie se rattache à l'entrée signée du même logement.
  React.useEffect(() => {
    if (type !== "sortie" || !bienId) return;
    let actif = true;
    void (async () => {
      setChargement(true);
      const liste = await listEntreesSignees(bienId);
      if (!actif) return;
      setEntrees(liste);
      setEntreeId((id) => (liste.some((e) => e.id === id) ? id : (liste[0]?.id ?? "")));
      setChargement(false);
    })();
    return () => {
      actif = false;
    };
  }, [type, bienId]);

  async function creer() {
    setCreation(true);
    const res = await creerEdl({ bien_id: bienId, type, entree_id: type === "sortie" ? entreeId || null : null });
    if (!res.ok) {
      setCreation(false);
      toast.error(res.error);
      return;
    }
    router.push(`/admin/etats-des-lieux/${res.data}`);
  }

  return (
    <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
      <div className="space-y-2">
        <Label htmlFor="edl-bien">Logement</Label>
        <select
          id="edl-bien"
          value={bienId}
          onChange={(e) => setBienId(e.target.value)}
          className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm"
        >
          <option value="">Choisir un logement…</option>
          {biens.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name ?? "Sans nom"}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Type</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["entree", "Entrée", "Arrivée du locataire"],
              ["sortie", "Sortie", "Départ, comparé à l'entrée"],
            ] as const
          ).map(([valeur, libelle, aide]) => (
            <button
              key={valeur}
              type="button"
              onClick={() => setType(valeur)}
              aria-pressed={type === valeur}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-colors",
                type === valeur ? "border-primary bg-primary/5" : "border-stone-200 hover:border-stone-300",
              )}
            >
              <span className="block font-semibold text-secondary">{libelle}</span>
              <span className="text-xs text-neutral-500">{aide}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {type === "sortie" && bienId && (
        <div className="space-y-2">
          <Label htmlFor="edl-entree">État des lieux d&apos;entrée à comparer</Label>
          {chargement ? (
            <p className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche des entrées signées…
            </p>
          ) : entrees.length > 0 ? (
            <select
              id="edl-entree"
              value={entreeId}
              onChange={(e) => setEntreeId(e.target.value)}
              className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm"
            >
              {entrees.map((e) => (
                <option key={e.id} value={e.id}>
                  {dateLongue(e.date_edl)} — {e.locataire_nom}
                </option>
              ))}
              <option value="">Aucune (sortie sans comparaison)</option>
            </select>
          ) : (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Aucun état des lieux d&apos;entrée signé pour ce logement : la sortie
              sera faite sans comparaison.
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Les pièces, les compteurs, les clés et les coordonnées sont repris de l&apos;entrée.
          </p>
        </div>
      )}

      <Button onClick={creer} disabled={!bienId || creation} className="h-11 w-full">
        {creation && <Loader2 className="h-4 w-4 animate-spin" />}
        Commencer la saisie
      </Button>
    </div>
  );
}
