"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { EtatDesLieux } from "@/src/lib/etat-des-lieux";

/**
 * Le formulaire lit la copie locale (saisie hors connexion) et l'état du
 * réseau dès son premier rendu : il ne s'affiche donc que dans le navigateur,
 * sans rendu serveur qui différerait de la tablette.
 */
const FormulaireEdl = dynamic(
  () => import("./formulaire-edl").then((m) => m.FormulaireEdl),
  {
    ssr: false,
    loading: () => (
      <p className="flex items-center gap-2 py-12 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement de la saisie…
      </p>
    ),
  },
);

export function SaisieEdl(props: {
  edl: EtatDesLieux;
  entree: EtatDesLieux | null;
  liens: Record<string, string>;
}) {
  return <FormulaireEdl {...props} />;
}
