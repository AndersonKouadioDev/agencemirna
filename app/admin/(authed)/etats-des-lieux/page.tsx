import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { listEdl } from "@/src/actions/admin/etats-des-lieux";
import { dateLongue, libelleType } from "@/src/lib/etat-des-lieux";
import { cn } from "@/lib/utils";

export const metadata = { title: "États des lieux" };

export default async function EtatsDesLieuxPage() {
  const liste = await listEdl();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">États des lieux</h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Saisie pièce par pièce sur tablette, signatures à l&apos;écran, PDF
            envoyé au locataire et au propriétaire. Une sortie se compare à
            l&apos;entrée du même logement.
          </p>
        </div>
        <Link
          href="/admin/etats-des-lieux/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nouvel état des lieux
        </Link>
      </div>

      {liste.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Aucun état des lieux</h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Ouvrez cette page sur la tablette, au logement, et créez l&apos;état
            des lieux d&apos;entrée du locataire.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Logement</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Locataire</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {liste.map((e) => (
                <tr key={e.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/etats-des-lieux/${e.id}`} className="font-medium text-secondary hover:text-primary">
                      {e.bien?.name ?? "Logement"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{libelleType(e.type)}</td>
                  <td className="px-4 py-3">{e.locataire_nom || <span className="italic text-neutral-400">à renseigner</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dateLongue(e.date_edl)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        e.statut === "signe"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-amber-200 bg-amber-50 text-amber-700",
                      )}
                    >
                      {e.statut === "signe" ? (e.envoye_le ? "Signé · envoyé" : "Signé") : "En cours de saisie"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
