import { MessageSquareQuote, Star } from "lucide-react";
import type { AvisPublic } from "@/src/actions/avis";
import { cn } from "@/lib/utils";

/**
 * Avis publiés des clients logés (modérés dans /admin/avis). Rien ne
 * s'affiche tant que le bien n'a aucun avis publié.
 */

const moisLong = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

function Etoiles({ note, taille = "h-4 w-4" }: { note: number; taille?: string }) {
  return (
    <span className="flex" aria-label={`${note} sur 5`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(taille, n <= Math.round(note) ? "fill-amber-400 text-amber-400" : "text-stone-300")}
        />
      ))}
    </span>
  );
}

export default function AvisSection({ avis }: { avis: AvisPublic[] }) {
  if (avis.length === 0) return null;

  const moyenne = avis.reduce((somme, a) => somme + a.note, 0) / avis.length;
  const moyenneAffichee = moyenne.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section
      id="avis"
      aria-labelledby="titre-avis"
      className="container mx-auto max-w-screen-xl px-4 md:px-8 py-12"
    >
      <div className="mb-8 flex flex-wrap items-end gap-x-6 gap-y-3">
        <h2 id="titre-avis" className="font-agate text-3xl sm:text-4xl font-bold text-secondary">
          Avis des voyageurs
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-secondary">{moyenneAffichee}</span>
          <div>
            <Etoiles note={moyenne} />
            <p className="text-xs text-neutral-500">
              {avis.length} avis vérifié{avis.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <ul className="grid gap-5 md:grid-cols-2">
        {avis.map((a) => (
          <li key={a.id} className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-secondary">{a.nom_affiche}</p>
                {a.mois_sejour && (
                  <p className="text-xs text-neutral-500">Séjour en {moisLong(a.mois_sejour)}</p>
                )}
              </div>
              <Etoiles note={a.note} />
            </div>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-700">{a.commentaire}</p>
            {a.reponse && (
              <div className="mt-4 rounded-2xl bg-[#FAF5EE] p-4">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                  <MessageSquareQuote className="h-3.5 w-3.5" />
                  Réponse de l&apos;Agence Mirna
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{a.reponse}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
