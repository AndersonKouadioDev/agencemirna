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
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type ActionResult,
  type BiensParZone,
  type CommuneAdminRow,
  toggleCommuneActive,
  deleteCommune,
} from "@/src/actions/admin/communes";
import {
  type QuartierRow,
  toggleQuartierActive,
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
  biensParZone,
}: {
  communes: CommuneAdminRow[];
  quartiers: QuartierRow[];
  biensParZone: BiensParZone;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);

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

  /**
   * Les Server Actions de ce module ne lèvent pas : elles renvoient
   * `{ ok: false, error }`. Jeter cette valeur faisait passer un refus RLS ou
   * une contrainte violée pour un succès — l'œil de dépublication restait sur
   * « actif » et l'admin en concluait que la commune était en ligne. Le
   * `finally` est tout aussi nécessaire : si l'appel jette (coupure réseau
   * pendant le POST), sans lui la ligne restait indéfiniment sur son spinner,
   * boutons désactivés.
   */
  async function action(cle: string, fn: () => Promise<ActionResult<unknown>>) {
    setBusy(cle);
    setErreur(null);
    try {
      const resultat = await fn();
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      router.refresh();
    } catch {
      setErreur("L'enregistrement n'a pas abouti. Vérifiez votre connexion.");
    } finally {
      setBusy(null);
    }
  }

  /** « 3 biens » / « 1 quartier » : un pluriel correct, sans « (s) ». */
  function pluriel(n: number, singulier: string) {
    return `${n} ${singulier}${n > 1 ? "s" : ""}`;
  }

  function supprimerCommune(c: CommuneAdminRow) {
    const rattaches = parCommune.map.get(c.id)?.length ?? 0;
    // Les biens comptent autant que les quartiers : `biens.commune_id` est en
    // ON DELETE SET NULL, la suppression les détache donc en silence et les
    // fait disparaître de tous les filtres de lieu, sans retour arrière.
    const biens = biensParZone.communes[c.id] ?? 0;
    const pertes: string[] = [];
    if (biens > 0) {
      pertes.push(
        `${pluriel(biens, "bien")} y sont rattachés : ils perdront leur commune et sortiront des filtres de lieu du site.`,
      );
    }
    if (rattaches > 0) {
      pertes.push(`${pluriel(rattaches, "quartier")} y sont rattachés : ils perdront leur commune.`);
    }
    const avertissement = pertes.length ? `\n\n${pertes.join("\n")}` : "";
    if (!confirm(`Supprimer la commune « ${c.nom} » ?${avertissement}`)) return;
    action(`c-${c.id}`, () => deleteCommune(c.id));
  }

  function supprimerQuartier(q: QuartierRow) {
    const biens = biensParZone.quartiers[q.id] ?? 0;
    const avertissement =
      biens > 0
        ? `\n\n${pluriel(biens, "bien")} y sont rattachés : ils perdront leur quartier et sortiront du filtre correspondant.`
        : "";
    if (!confirm(`Supprimer le quartier « ${q.name} » ?${avertissement}`)) return;
    action(`q-${q.id}`, () => deleteQuartier(q.id));
  }

  return (
    <div className="space-y-4">
      {erreur && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span className="text-sm text-red-800">{erreur}</span>
          </div>
          <button
            type="button"
            onClick={() => setErreur(null)}
            className="rounded p-1 text-red-700 hover:bg-red-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {communes.map((commune) => {
        const enfants = parCommune.map.get(commune.id) ?? [];
        const occupe = busy === `c-${commune.id}`;
        const biens = biensParZone.communes[commune.id] ?? 0;

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
                    : pluriel(enfants.length, "quartier")}{" "}
                  · {biens === 0 ? "aucun bien" : pluriel(biens, "bien")}
                </p>
                {commune.is_featured && !commune.image && (
                  <p className="text-xs text-amber-700 mt-1">
                    Sans image : la carte d&apos;accueil s&apos;affichera vide.
                  </p>
                )}
                {/* « Communes phares » écarte les communes sans bien AVANT de
                    retenir celles qui sont cochées : cocher la case ne suffit
                    donc pas, et rien sur cet écran ne le disait. */}
                {commune.is_featured && biens === 0 && (
                  <p className="text-xs text-amber-700 mt-1">
                    Aucun bien rattaché : l&apos;accueil l&apos;écarte malgré la
                    case cochée, une carte ne devant pas mener à un catalogue
                    vide.
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
                  const biensQuartier = biensParZone.quartiers[q.id] ?? 0;
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
                        <p className="text-xs text-neutral-500 truncate">
                          ordre {q.ordre} ·{" "}
                          {biensQuartier === 0
                            ? "aucun bien"
                            : pluriel(biensQuartier, "bien")}
                          {q.tagline ? ` · ${q.tagline}` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
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
