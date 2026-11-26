import {
  cleComparaison,
  dateLongue,
  ETATS,
  estDegrade,
  etatsALEntree,
  libelleEtat,
  type EtatDesLieux,
} from "@/src/lib/etat-des-lieux";
import { cn } from "@/lib/utils";

/** Lecture d'un état des lieux signé dans l'admin (même contenu que le PDF). */

const couleur = (etat: string) =>
  ETATS.find((e) => e.valeur === etat)?.couleur ?? "bg-stone-100 text-neutral-600 border-stone-200";

function Photo({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block h-28 w-36 overflow-hidden rounded-lg bg-stone-100">
      {/* eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </a>
  );
}

export function VueEdl({
  edl,
  entree,
  liens,
}: {
  edl: EtatDesLieux;
  entree: EtatDesLieux | null;
  liens: Record<string, string>;
}) {
  const comparaison = edl.type === "sortie" && entree ? etatsALEntree(entree) : null;
  const ligne = (etiquette: string, valeur?: string | null) => (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{etiquette}</dt>
      <dd className="font-medium text-secondary">{valeur?.trim() || "—"}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ligne("Date", dateLongue(edl.date_edl))}
          {ligne("Locataire", [edl.locataire_nom, edl.locataire_telephone, edl.locataire_email].filter(Boolean).join(" · "))}
          {ligne("Propriétaire", [edl.proprietaire_nom, edl.proprietaire_email].filter(Boolean).join(" · "))}
          {ligne("Agent", edl.agent_nom)}
        </dl>
        {comparaison && entree && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Comparé à l&apos;état des lieux d&apos;entrée du {dateLongue(entree.date_edl)} : les
            éléments dégradés sont signalés en rouge.
          </p>
        )}
      </section>

      {edl.pieces.map((piece) => (
        <section key={piece.id} className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-secondary">{piece.nom}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="py-2 pr-3">Élément</th>
                  {comparaison && <th className="py-2 pr-3">À l&apos;entrée</th>}
                  <th className="py-2 pr-3">État</th>
                  <th className="py-2">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {piece.elements.map((el) => {
                  const avant = comparaison?.get(cleComparaison(piece.nom, el.nom));
                  const degrade = estDegrade(avant?.etat, el.etat);
                  return (
                    <tr key={el.id} className={cn(degrade && "bg-red-50")}>
                      <td className="py-2 pr-3 font-medium">{el.nom}</td>
                      {comparaison && <td className="py-2 pr-3 text-neutral-600">{avant ? libelleEtat(avant.etat) : "—"}</td>}
                      <td className="py-2 pr-3">
                        <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold", el.etat ? couleur(el.etat) : "border-stone-200 text-neutral-500")}>
                          {libelleEtat(el.etat)}
                        </span>
                        {degrade && <span className="ml-2 text-xs font-bold text-red-600">dégradé</span>}
                      </td>
                      <td className="py-2 text-neutral-700">{el.commentaire}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {piece.commentaire && <p className="mt-3 text-sm text-neutral-600">Remarque : {piece.commentaire}</p>}
          {piece.photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {piece.photos.map((p) => (
                <Photo key={p} src={liens[p]} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-secondary">Compteurs</h2>
          <ul className="space-y-3 text-sm">
            {edl.compteurs.map((c) => {
              const avant = entree?.compteurs.find((x) => x.libelle === c.libelle);
              return (
                <li key={c.id} className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.libelle}</p>
                    <p className="text-neutral-600">
                      N° {c.numero || "—"} · relevé {c.releve || "—"}
                      {avant ? ` (entrée : ${avant.releve || "—"})` : ""}
                    </p>
                  </div>
                  {c.photo && <Photo src={liens[c.photo]} />}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-secondary">Clés remises</h2>
          <ul className="divide-y divide-stone-100 text-sm">
            {edl.cles.map((c) => {
              const avant = entree?.cles.find((x) => x.libelle === c.libelle);
              return (
                <li key={c.id} className="flex justify-between py-2">
                  <span>{c.libelle}</span>
                  <span className="font-semibold">
                    {c.nombre}
                    {avant ? <span className="ml-2 font-normal text-neutral-500">(entrée : {avant.nombre})</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {edl.observations && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 text-lg font-bold text-secondary">Observations générales</h2>
          <p className="whitespace-pre-line text-sm text-neutral-700">{edl.observations}</p>
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-1 text-lg font-bold text-secondary">Signatures</h2>
        {edl.signe_le && <p className="mb-4 text-sm text-neutral-500">Signé le {dateLongue(edl.signe_le)}</p>}
        <div className="grid gap-6 sm:grid-cols-2">
          {(
            [
              ["Le locataire", edl.locataire_nom, edl.signature_locataire],
              ["Pour l'Agence Mirna", edl.agent_nom, edl.signature_agent],
            ] as const
          ).map(([role, nom, chemin]) => (
            <div key={role}>
              <p className="text-xs uppercase tracking-wide text-neutral-500">{role}</p>
              <p className="font-semibold">{nom || "—"}</p>
              <div className="mt-2 flex h-28 items-center justify-center rounded-xl border border-stone-200 bg-white">
                {chemin && liens[chemin] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire
                  <img src={liens[chemin]} alt={`Signature : ${nom}`} className="max-h-24 object-contain" />
                ) : (
                  <span className="text-sm text-neutral-400">Non signée</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
