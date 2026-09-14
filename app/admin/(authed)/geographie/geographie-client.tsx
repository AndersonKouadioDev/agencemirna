"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Plus,
  MapPin,
  ImageOff,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type CommuneAdminRow,
  toggleCommuneActive,
  deleteCommune,
} from "@/src/actions/admin/communes";
import {
  type QuartierRow,
  toggleQuartierActive,
  toggleQuartierFeatured,
  deleteQuartier,
} from "@/src/actions/admin/quartiers";

/**
 * Gestion conjointe des communes et de leurs quartiers.
 *
 * Les deux entités étaient administrées sur deux pages distinctes, alors
 * qu'un quartier n'existe que rattaché à une commune : on ne voyait donc
 * jamais le rattachement, ni les communes restées sans quartier.
 */
export function GeographieClient({
  communes,
  quartiers,
}: {
  communes: CommuneAdminRow[];
  quartiers: QuartierRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  /**
   * Rattachement tolérant : `commune_id` fait foi, mais les quartiers saisis
   * avant la migration 0015 ne portent que le libellé texte.
   */
  const parCommune = React.useMemo(() => {
    const map = new Map<string, QuartierRow[]>();
    communes.forEach((c) => map.set(c.id, []));
    const orphelins: QuartierRow[] = [];

    quartiers.forEach((q) => {
      const parId = q.commune_id ? communes.find((c) => c.id === q.commune_id) : null;
      const parNom =
        !parId && q.commune
          ? communes.find(
              (c) => c.nom.trim().toLowerCase() === q.commune.trim().toLowerCase(),
            )
          : null;
      const commune = parId ?? parNom;
      if (commune) map.get(commune.id)!.push(q);
      else orphelins.push(q);
    });

    return { map, orphelins };
  }, [communes, quartiers]);

  async function action(cle: string, fn: () => Promise<unknown>) {
    setBusy(cle);
    await fn();
    setBusy(null);
    router.refresh();
  }

  function supprimerCommune(c: CommuneAdminRow) {
    const rattaches = parCommune.map.get(c.id)?.length ?? 0;
    const avertissement = rattaches
      ? `\n\n${rattaches} quartier(s) y sont rattachés : ils perdront leur commune.`
      : "";
    if (!confirm(`Supprimer la commune « ${c.nom} » ?${avertissement}`)) return;
    action(`c-${c.id}`, () => deleteCommune(c.id));
  }

  function supprimerQuartier(q: QuartierRow) {
    if (!confirm(`Supprimer le quartier « ${q.name} » ?`)) return;
    action(`q-${q.id}`, () => deleteQuartier(q.id));
  }

  return (
    <div className="space-y-4">
      {communes.map((commune) => {
        const enfants = parCommune.map.get(commune.id) ?? [];
        const occupe = busy === `c-${commune.id}`;

        return (
          <section
            key={commune.id}
            className={cn(
              "rounded-xl border bg-white transition-opacity",
              commune.is_active ? "border-stone-200" : "border-stone-200 opacity-60",
            )}
          >
            {/* ── La commune ── */}
            <header className="flex items-center gap-4 p-4">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {commune.image ? (
                  <Image
                    src={commune.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-stone-300">
                    <ImageOff className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-lg text-neutral-900">{commune.nom}</h2>
                  {commune.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <Star className="h-2.5 w-2.5" />
                      Accueil
                    </span>
                  )}
                  {!commune.is_active && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  /{commune.slug} · ordre {commune.ordre} ·{" "}
                  {enfants.length === 0
                    ? "aucun quartier"
                    : `${enfants.length} quartier${enfants.length > 1 ? "s" : ""}`}
                </p>
                {commune.is_featured && !commune.image && (
                  <p className="text-xs text-amber-700 mt-1">
                    Sans image : la carte d&apos;accueil s&apos;affichera vide.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button asChild variant="outline" size="sm" className="h-8">
                  <Link href={`/admin/quartiers/nouveau?commune=${commune.id}`}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Quartier
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    action(`c-${commune.id}`, () =>
                      toggleCommuneActive(commune.id, !commune.is_active),
                    )
                  }
                  aria-label={commune.is_active ? "Désactiver" : "Activer"}
                  disabled={occupe}
                >
                  {commune.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link
                    href={`/admin/communes/${commune.id}`}
                    aria-label={`Modifier ${commune.nom}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => supprimerCommune(commune)}
                  aria-label={`Supprimer ${commune.nom}`}
                  disabled={occupe}
                >
                  {occupe ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </header>

            {/* ── Ses quartiers ── */}
            {enfants.length > 0 && (
              <ul className="border-t border-stone-100 divide-y divide-stone-50">
                {enfants.map((q) => {
                  const pris = busy === `q-${q.id}`;
                  return (
                    <li key={q.id} className="flex items-center gap-3 py-2.5 pl-8 pr-4">
                      <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
                      <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded bg-stone-100">
                        {q.image ? (
                          <Image
                            src={q.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center text-stone-300">
                            <ImageOff className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            q.is_active ? "text-neutral-900" : "text-neutral-400",
                          )}
                        >
                          {q.name}
                          {!q.commune_id && (
                            <span
                              className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-amber-700"
                              title="Rattaché par correspondance de nom, pas par identifiant"
                            >
                              lien fragile
                            </span>
                          )}
                        </p>
                        {q.tagline && (
                          <p className="text-xs text-neutral-500 truncate">{q.tagline}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            q.is_featured ? "text-primary" : "text-stone-400",
                          )}
                          onClick={() =>
                            action(`q-${q.id}`, () =>
                              toggleQuartierFeatured(q.id, !q.is_featured),
                            )
                          }
                          aria-label="Mettre en avant"
                          disabled={pris}
                        >
                          <Star
                            className={cn("h-4 w-4", q.is_featured && "fill-current")}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            action(`q-${q.id}`, () =>
                              toggleQuartierActive(q.id, !q.is_active),
                            )
                          }
                          aria-label={q.is_active ? "Désactiver" : "Activer"}
                          disabled={pris}
                        >
                          {q.is_active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link
                            href={`/admin/quartiers/${q.id}`}
                            aria-label={`Modifier ${q.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => supprimerQuartier(q)}
                          aria-label={`Supprimer ${q.name}`}
                          disabled={pris}
                        >
                          {pris ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {/* ── Quartiers sans commune identifiable ── */}
      {parCommune.orphelins.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50/50 p-4">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-700" />
            Quartiers sans commune
          </h2>
          <p className="text-xs text-neutral-600 mt-1 mb-3">
            Ils n&apos;apparaissent dans aucun filtre de la vitrine tant
            qu&apos;une commune ne leur est pas attribuée.
          </p>
          <ul className="space-y-1">
            {parCommune.orphelins.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-800">{q.name}</span>
                <Button asChild variant="outline" size="sm" className="h-7">
                  <Link href={`/admin/quartiers/${q.id}`}>Rattacher</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
