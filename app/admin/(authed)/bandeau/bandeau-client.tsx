"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowRight,
  ChevronDown,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ICONES_BANDEAU,
  iconeBandeau,
} from "@/src/lib/bandeau-icones";
import {
  JETON_TELEPHONE,
  lienAvecJetons,
  texteAvecJetons,
} from "@/src/lib/bandeau";
import {
  deleteInfoBandeau,
  reorderInfosBandeau,
  toggleInfoBandeau,
  upsertInfoBandeau,
  type InfoBandeauRow,
} from "@/src/actions/admin/bandeau";

export function BandeauClient({
  infos,
  telephone,
  telHref,
}: {
  infos: InfoBandeauRow[];
  telephone: string;
  telHref: string;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(infos);
  const [ouvert, setOuvert] = React.useState<string | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, setEnCours] = React.useState(false);

  // Le serveur reste la source de vérité : après un `router.refresh()`, la
  // liste locale doit repartir de ce qu'il renvoie, sinon un enregistrement
  // refusé laisserait à l'écran une valeur qui n'existe nulle part.
  const [infosRendues, setInfosRendues] = React.useState(infos);
  if (infos !== infosRendues) {
    setInfosRendues(infos);
    setItems(infos);
  }

  const jetons = { phone: telephone, telHref };
  const capteurs = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  async function agir(action: () => Promise<{ ok: boolean; error?: string }>) {
    setErreur(null);
    setEnCours(true);
    const r = await action();
    setEnCours(false);
    if (!r.ok) {
      setErreur(r.error ?? "Une erreur est survenue.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    router.refresh();
    return true;
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const depuis = items.findIndex((i) => i.id === active.id);
    const vers = items.findIndex((i) => i.id === over.id);
    if (depuis === -1 || vers === -1) return;

    // Réordonné à l'écran d'abord : attendre l'aller-retour serveur ferait
    // revenir la ligne à sa place le temps de la requête.
    const suivant = arrayMove(items, depuis, vers);
    setItems(suivant);
    await agir(() => reorderInfosBandeau(suivant.map((i) => i.id)));
  }

  async function ajouter() {
    const ok = await agir(() =>
      upsertInfoBandeau({ texte: "Nouvelle information", icone: "megaphone" }),
    );
    if (ok) setOuvert(null);
  }

  const apercu = items.filter((i) => i.is_active);

  return (
    <div className="space-y-6">
      {erreur && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {/* Aperçu : le même rendu que le site, sans l'animation — un bandeau qui
          défile pendant qu'on le compose est illisible. */}
      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="mb-1 text-base font-semibold text-neutral-900">
          Aperçu
        </h2>
        <p className="mb-3 text-xs text-neutral-500">
          Rendu réel des lignes actives. Sur le site, elles défilent en boucle.
        </p>
        <div className="overflow-x-auto rounded-md border border-[#F5B324]/20 bg-secondary">
          <div className="flex w-max">
            {apercu.length === 0 ? (
              <span className="px-8 py-3 text-sm text-white/60">
                Aucune ligne active : le site affichera ses messages de repli.
              </span>
            ) : (
              apercu.map((info) => {
                return (
                  <span
                    key={info.id}
                    className="inline-flex items-center gap-2.5 whitespace-nowrap border-r border-white/10 px-8 py-3 text-sm font-medium text-white"
                  >
                    <Pictogramme cle={info.icone} className="h-4 w-4 shrink-0 text-[#F5B324]" />
                    {texteAvecJetons(info.texte, jetons)}
                    {lienAvecJetons(info.lien, jetons) && (
                      <ArrowRight className="h-3.5 w-3.5 text-[#F5B324] opacity-70" />
                    )}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Lignes */}
      <DndContext
        sensors={capteurs}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((info) => (
              <LigneBandeau
                key={info.id}
                info={info}
                ouvert={ouvert === info.id}
                onOuvrir={() => setOuvert(ouvert === info.id ? null : info.id)}
                onEnregistrer={(data) =>
                  agir(() => upsertInfoBandeau({ ...data, id: info.id }))
                }
                onBasculer={(actif) =>
                  agir(() => toggleInfoBandeau(info.id, actif))
                }
                onSupprimer={() => agir(() => deleteInfoBandeau(info.id))}
                enCours={enCours}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-neutral-500">
          Aucune information. Tant que cette liste est vide, le site affiche
          trois messages de repli (estimation, téléphone, services).
        </p>
      )}

      <Button
        type="button"
        onClick={ajouter}
        disabled={enCours}
        className="bg-primary text-secondary hover:bg-[#D4981C]"
      >
        {enCours ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <span className="ml-1.5">Ajouter une information</span>
      </Button>
    </div>
  );
}

// ============================================================================

type Brouillon = {
  texte: string;
  lien: string | null;
  icone: string;
  starts_at: string | null;
  ends_at: string | null;
};

function LigneBandeau({
  info,
  ouvert,
  onOuvrir,
  onEnregistrer,
  onBasculer,
  onSupprimer,
  enCours,
}: {
  info: InfoBandeauRow;
  ouvert: boolean;
  onOuvrir: () => void;
  onEnregistrer: (data: Brouillon) => Promise<boolean>;
  onBasculer: (actif: boolean) => Promise<boolean>;
  onSupprimer: () => Promise<boolean>;
  enCours: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: info.id });

  const [brouillon, setBrouillon] = React.useState<Brouillon>({
    texte: info.texte,
    lien: info.lien,
    icone: info.icone,
    starts_at: info.starts_at,
    ends_at: info.ends_at,
  });

  // La ligne rouverte doit repartir de ce que le serveur a réellement
  // enregistré, pas d'une saisie abandonnée au précédent dépliage.
  const [infoRendue, setInfoRendue] = React.useState(info);
  if (info !== infoRendue) {
    setInfoRendue(info);
    setBrouillon({
      texte: info.texte,
      lien: info.lien,
      icone: info.icone,
      starts_at: info.starts_at,
      ends_at: info.ends_at,
    });
  }

  const idTexte = React.useId();
  const idLien = React.useId();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-lg border border-stone-200 bg-white",
        isDragging && "opacity-60 shadow-lg",
        !info.is_active && "bg-stone-50",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Déplacer"
          className="cursor-grab text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Pictogramme cle={brouillon.icone} className="h-4 w-4 shrink-0 text-primary" />

        <button
          type="button"
          onClick={onOuvrir}
          aria-expanded={ouvert}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={cn(
              "truncate text-sm",
              info.is_active ? "text-neutral-900" : "text-neutral-400 line-through",
            )}
          >
            {info.texte}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
              ouvert && "rotate-180",
            )}
          />
        </button>

        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={info.is_active}
            onChange={(e) => onBasculer(e.target.checked)}
            disabled={enCours}
            className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30"
          />
          Actif
        </label>

        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Supprimer définitivement « ${info.texte} » ?`,
              )
            ) {
              onSupprimer();
            }
          }}
          disabled={enCours}
          aria-label="Supprimer"
          className="shrink-0 rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {ouvert && (
        <div className="space-y-4 border-t border-stone-200 p-4">
          <div>
            <Label className="mb-2 block text-xs font-medium text-neutral-700">
              Pictogramme
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {ICONES_BANDEAU.map(({ cle, libelle, Icone: I }) => (
                <button
                  key={cle}
                  type="button"
                  title={libelle}
                  aria-label={libelle}
                  aria-pressed={brouillon.icone === cle}
                  onClick={() => setBrouillon((b) => ({ ...b, icone: cle }))}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-md border transition-colors",
                    brouillon.icone === cle
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-stone-200 text-neutral-500 hover:bg-stone-50",
                  )}
                >
                  <I className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label
              htmlFor={idTexte}
              className="mb-1.5 block text-xs font-medium text-neutral-700"
            >
              Message
            </Label>
            <Input
              id={idTexte}
              value={brouillon.texte}
              maxLength={160}
              onChange={(e) =>
                setBrouillon((b) => ({ ...b, texte: e.target.value }))
              }
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              {brouillon.texte.length}/160 — le bandeau défile, un message court
              se lit. Écrivez <code>{JETON_TELEPHONE}</code> pour insérer le
              numéro de l&apos;agence : il suivra /admin/paramètres.
            </p>
          </div>

          <div>
            <Label
              htmlFor={idLien}
              className="mb-1.5 block text-xs font-medium text-neutral-700"
            >
              Lien (facultatif)
            </Label>
            <Input
              id={idLien}
              value={brouillon.lien ?? ""}
              placeholder="/contact_us, https://… ou {telephone}"
              onChange={(e) =>
                setBrouillon((b) => ({ ...b, lien: e.target.value }))
              }
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Chemin interne, URL complète, ou <code>{JETON_TELEPHONE}</code>{" "}
              pour ouvrir l&apos;appel. Sans lien, le message reste du texte.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-neutral-700">
                Afficher à partir du
              </Label>
              <Input
                type="datetime-local"
                value={versChampLocal(brouillon.starts_at)}
                onChange={(e) =>
                  setBrouillon((b) => ({
                    ...b,
                    starts_at: depuisChampLocal(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-neutral-700">
                Jusqu&apos;au
              </Label>
              <Input
                type="datetime-local"
                value={versChampLocal(brouillon.ends_at)}
                onChange={(e) =>
                  setBrouillon((b) => ({
                    ...b,
                    ends_at: depuisChampLocal(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500">
            Laissez vide pour un affichage permanent. Une information de saison
            s&apos;éteint ainsi toute seule.
          </p>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={enCours}
              onClick={() => onEnregistrer(brouillon)}
              className="bg-primary text-secondary hover:bg-[#D4981C]"
            >
              {enCours && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * `datetime-local` ne porte pas de fuseau : Postgres rangerait la chaîne telle
 * quelle dans un `timestamptz`, donc en UTC, alors que la relecture reformate
 * en heure locale du poste. La fenêtre d'affichage se décalait d'autant à
 * chaque réenregistrement hors du fuseau d'Abidjan.
 */
function depuisChampLocal(valeur: string): string | null {
  if (!valeur) return null;
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function versChampLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Résout la clé en pictogramme SANS assigner de composant pendant le rendu :
 * `const Icone = iconeBandeau(cle); <Icone />` est flagué par le lint React,
 * qui y voit un composant créé à chaque rendu — donc démonté et remonté à
 * chaque frappe. Le composant est en réalité stable (module lucide), mais
 * `createElement` dit la même chose sans laisser la règle deviner.
 */
function Pictogramme({ cle, className }: { cle: string; className?: string }) {
  return React.createElement(iconeBandeau(cle), { className });
}
