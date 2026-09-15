"use client";

import * as React from "react";
import Link from "next/link";
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
import { GripVertical, ImageIcon, Pencil, PlayCircle, Trash2, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMPLACEMENTS_PUB } from "@/src/lib/publicites";
import {
  deletePublicite,
  reorderPublicites,
  togglePublicite,
  type PubliciteAdminRow,
} from "@/src/actions/admin/publicites";

/**
 * Les publicités, groupées par emplacement — c'est ainsi qu'elles s'affichent.
 * On ne glisse une ligne QUE dans son groupe : l'ordre n'a de sens qu'entre
 * pubs d'un même carrousel. Changer d'emplacement se fait dans le formulaire.
 */
export function PublicitesGrid({ publicites }: { publicites: PubliciteAdminRow[] }) {
  const router = useRouter();
  const [lignes, setLignes] = React.useState(publicites);
  const [erreur, setErreur] = React.useState<string | null>(null);
  // `Date.now()` pendant le rendu est impur, et diverge entre serveur et
  // client : une pub qui expire entre les deux ferait diverger l'hydratation.
  // L'instant est fixé une fois, en état initial paresseux, et passé aux lignes.
  const [maintenant] = React.useState(() => Date.now());

  const [rendues, setRendues] = React.useState(publicites);
  if (publicites !== rendues) {
    setRendues(publicites);
    setLignes(publicites);
  }

  const capteurs = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function agir(action: () => Promise<{ ok: boolean; error?: string }>) {
    setErreur(null);
    const r = await action();
    if (!r.ok) {
      setErreur(r.error ?? "Une erreur est survenue.");
      return;
    }
    router.refresh();
  }

  const groupes = EMPLACEMENTS_PUB.map((e) => ({
    ...e,
    pubs: lignes.filter((p) => p.emplacement === e.cle),
  })).filter((g) => g.pubs.length > 0);

  // Une clé qui n'est plus dans le registre : la pub n'est affichée nulle part.
  const orphelines = lignes.filter((p) => !EMPLACEMENTS_PUB.some((e) => e.cle === p.emplacement));

  async function onDragEnd(cle: string, e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const groupe = lignes.filter((p) => p.emplacement === cle);
    const depuis = groupe.findIndex((p) => p.id === active.id);
    const vers = groupe.findIndex((p) => p.id === over.id);
    if (depuis === -1 || vers === -1) return;
    const nouveau = arrayMove(groupe, depuis, vers);
    setLignes((l) => [...l.filter((p) => p.emplacement !== cle), ...nouveau]);
    await agir(() => reorderPublicites(nouveau.map((p) => p.id)));
  }

  if (lignes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-neutral-500">
        Aucune publicité. Les emplacements du site restent invisibles tant
        qu&apos;ils sont vides — pas de cadre, pas d&apos;espace réservé.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {erreur && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</div>
      )}

      {groupes.map((g) => (
        <section key={g.cle}>
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">{g.libelle}</h2>
            <span className="text-xs text-neutral-500">
              {g.pubs.length > 1 ? `carrousel · ${g.pubs.length} publicités` : "1 publicité"} · format {g.format}
            </span>
          </header>
          <DndContext sensors={capteurs} collisionDetection={closestCenter} onDragEnd={(e) => onDragEnd(g.cle, e)}>
            <SortableContext items={g.pubs.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {g.pubs.map((pub) => (
                  <Ligne
                    key={pub.id}
                    pub={pub}
                    onBasculer={(v) => agir(() => togglePublicite(pub.id, v))}
                    onSupprimer={() => agir(() => deletePublicite(pub.id))}
                    maintenant={maintenant}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      ))}

      {orphelines.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-amber-800">
            Emplacement inconnu — ces publicités ne s&apos;affichent nulle part
          </h2>
          <div className="space-y-2">
            {orphelines.map((pub) => (
              <Ligne key={pub.id} pub={pub} onBasculer={(v) => agir(() => togglePublicite(pub.id, v))} onSupprimer={() => agir(() => deletePublicite(pub.id))} maintenant={maintenant} statique />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const ICONE_TYPE = { image: ImageIcon, texte: Type, video: PlayCircle } as const;

function Ligne({
  pub,
  onBasculer,
  onSupprimer,
  maintenant,
  statique = false,
}: {
  pub: PubliciteAdminRow;
  onBasculer: (v: boolean) => void;
  onSupprimer: () => void;
  /** Instant de référence fixé par le parent : jamais `Date.now()` ici. */
  maintenant: number;
  statique?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pub.id, disabled: statique });
  const IconeType = ICONE_TYPE[pub.type] ?? ImageIcon;
  const aVenir = pub.starts_at ? new Date(pub.starts_at).getTime() > maintenant : false;
  const expiree = pub.ends_at ? new Date(pub.ends_at).getTime() < maintenant : false;
  const bienDepublie = pub.biens && !pub.biens.is_active;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3",
        isDragging && "opacity-60 shadow-lg",
        !pub.is_active && "bg-stone-50",
      )}
    >
      {!statique && (
        <button type="button" {...attributes} {...listeners} aria-label="Déplacer" className="cursor-grab text-neutral-400 hover:text-neutral-700 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-stone-100 text-neutral-600" title={pub.type}>
        <IconeType className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", pub.is_active ? "text-neutral-900" : "text-neutral-400")}>{pub.titre}</p>
        <p className="truncate text-xs text-neutral-500">
          {pub.accroche || pub.corps || "—"}
          {pub.biens?.name && <> · {pub.biens.name}</>}
        </p>
      </div>
      <div className="hidden shrink-0 gap-1 sm:flex">
        {aVenir && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700">À venir</span>}
        {expiree && <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-700">Expirée</span>}
        {bienDepublie && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700" title="Le bien promu est dépublié : la pub reste, sans destination">Bien dépublié</span>}
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-neutral-500">
        <input type="checkbox" checked={pub.is_active} onChange={(e) => onBasculer(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30" />
        Active
      </label>
      <Link href={`/admin/publicites/${pub.id}`} aria-label="Modifier" className="shrink-0 rounded p-1.5 text-neutral-400 hover:bg-stone-100 hover:text-neutral-900">
        <Pencil className="h-4 w-4" />
      </Link>
      <button type="button" onClick={() => { if (window.confirm(`Supprimer définitivement « ${pub.titre} » ?`)) onSupprimer(); }} aria-label="Supprimer" className="shrink-0 rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
