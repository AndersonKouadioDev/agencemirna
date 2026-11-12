"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Mail,
  Phone,
  Home,
  Calculator,
  Megaphone,
  CalendarDays,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteLead,
  deleteLeads,
  updateLeadsStatus,
  type LeadRow,
  type LeadStatus,
} from "@/src/actions/admin/leads";

const SOURCE_META: Record<
  string,
  { icon: typeof Home; label: string; color: string }
> = {
  contact: { icon: Mail, label: "Contact", color: "bg-blue-100 text-blue-700" },
  estimation: {
    icon: Calculator,
    label: "Estimation",
    color: "bg-amber-100 text-amber-700",
  },
  visit_request: {
    icon: Home,
    label: "Visite",
    color: "bg-purple-100 text-purple-700",
  },
  newsletter: {
    icon: Megaphone,
    label: "Newsletter",
    color: "bg-pink-100 text-pink-700",
  },
  other: { icon: Mail, label: "Autre", color: "bg-neutral-100 text-neutral-700" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: "Nouveau", color: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: {
    label: "En cours",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  qualified: {
    label: "Qualifié",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  converted: {
    label: "Converti",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejeté",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  archived: {
    label: "Archivé",
    color: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? "s" : ""}`;
}

/** Le clic sur une case à cocher arrive par un événement souris : on y lit Maj. */
function avecMaj(e: React.ChangeEvent<HTMLInputElement>): boolean {
  const natif = e.nativeEvent as Partial<MouseEvent>;
  return natif.shiftKey === true;
}

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [selection, setSelection] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [actionGroupee, setActionGroupee] = React.useState(false);
  // Dernière case cochée : Maj + clic coche toute la plage jusqu'à elle.
  const ancre = React.useRef<number | null>(null);

  // La sélection peut garder des identifiants qui ne sont plus affichés
  // (changement de filtre, suppression) : seuls les leads visibles comptent.
  const selectionnes = React.useMemo(
    () => leads.filter((l) => selection.has(l.id)).map((l) => l.id),
    [leads, selection],
  );
  const nb = selectionnes.length;
  const tousCoches = leads.length > 0 && nb === leads.length;
  const partiel = nb > 0 && !tousCoches;

  const basculer = React.useCallback(
    (index: number, plage: boolean) => {
      const depart = ancre.current;
      ancre.current = index;
      setSelection((avant) => {
        const apres = new Set(avant);
        const cible = leads[index];
        if (!cible) return avant;
        const cocher = !avant.has(cible.id);
        const [debut, fin] =
          plage && depart !== null
            ? [Math.min(depart, index), Math.max(depart, index)]
            : [index, index];
        for (let i = debut; i <= fin; i++) {
          const id = leads[i]?.id;
          if (!id) continue;
          if (cocher) apres.add(id);
          else apres.delete(id);
        }
        return apres;
      });
    },
    [leads],
  );

  function basculerTout() {
    ancre.current = null;
    setSelection(tousCoches ? new Set() : new Set(leads.map((l) => l.id)));
  }

  function viderSelection() {
    ancre.current = null;
    setSelection(new Set());
  }

  const onDelete = React.useCallback(
    async (id: string) => {
      if (!confirm("Supprimer ce lead ? Action irréversible.")) return;
      setBusy(id);
      // Le résultat était ignoré : sur session expirée ou refus RLS, la ligne
      // réapparaissait après le refresh sans le moindre message, ce qui se lit
      // comme un bug d'affichage plutôt que comme un échec de suppression.
      const res = await deleteLead(id);
      setBusy(null);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    },
    [router],
  );

  async function supprimerSelection() {
    if (nb === 0) return;
    if (
      !confirm(
        `Supprimer définitivement ${pluriel(nb, "lead")} ? Action irréversible.`,
      )
    ) {
      return;
    }
    setActionGroupee(true);
    const res = await deleteLeads(selectionnes);
    setActionGroupee(false);
    if (!res.ok) {
      alert(res.error);
    } else {
      viderSelection();
    }
    router.refresh();
  }

  async function changerStatutSelection(statut: LeadStatus) {
    if (nb === 0) return;
    setActionGroupee(true);
    const res = await updateLeadsStatus(selectionnes, statut);
    setActionGroupee(false);
    if (!res.ok) {
      alert(res.error);
    } else {
      viderSelection();
    }
    router.refresh();
  }

  return (
    // Marge basse tant que la barre flottante est affichée : sans elle, la
    // barre masquerait la dernière ligne du tableau.
    <div className={cn(nb > 0 && "pb-24")}>
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="w-10 pl-4 pr-1 py-3">
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  title="Tout sélectionner"
                  checked={tousCoches}
                  ref={(el) => {
                    if (el) el.indeterminate = partiel;
                  }}
                  onChange={basculerTout}
                  className="h-4 w-4 cursor-pointer accent-primary align-middle"
                />
              </th>
              <th className="text-left px-4 py-3 font-semibold">Source</th>
              <th className="text-left px-4 py-3 font-semibold">Demandeur</th>
              <th className="text-left px-4 py-3 font-semibold">Contact</th>
              <th className="text-left px-4 py-3 font-semibold">Sujet / Bien</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {leads.map((lead, index) => (
              <LigneLead
                key={lead.id}
                lead={lead}
                index={index}
                coche={selection.has(lead.id)}
                occupe={busy === lead.id}
                onBasculer={basculer}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {nb > 0 && (
        <div
          role="toolbar"
          aria-label="Actions sur la sélection"
          className="fixed bottom-6 left-1/2 z-40 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-2xl"
        >
          <span className="font-semibold text-secondary">
            {pluriel(nb, "sélectionné")}
          </span>
          {tousCoches && leads.length >= 1000 && (
            <span className="text-xs text-neutral-500">
              (les 1000 affichés)
            </span>
          )}

          <select
            value=""
            disabled={actionGroupee}
            onChange={(e) => {
              const statut = e.target.value as LeadStatus;
              if (statut) void changerStatutSelection(statut);
            }}
            aria-label="Changer le statut de la sélection"
            className="h-9 rounded-lg border border-stone-200 bg-white px-2 text-xs font-medium text-neutral-700 disabled:opacity-50"
          >
            <option value="" disabled>
              Changer le statut…
            </option>
            {Object.entries(STATUS_META).map(([valeur, meta]) => (
              <option key={valeur} value={valeur}>
                {meta.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={supprimerSelection}
            disabled={actionGroupee}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {actionGroupee ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Supprimer
          </button>

          <button
            type="button"
            onClick={viderSelection}
            disabled={actionGroupee}
            aria-label="Désélectionner"
            title="Désélectionner"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-neutral-600 hover:bg-stone-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Une ligne, mémoïsée : cocher une case ne redessine que la ligne concernée,
 * même avec un millier de leads affichés.
 */
const LigneLead = React.memo(function LigneLead({
  lead,
  index,
  coche,
  occupe,
  onBasculer,
  onDelete,
}: {
  lead: LeadRow;
  index: number;
  coche: boolean;
  occupe: boolean;
  onBasculer: (index: number, plage: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const sourceMeta = SOURCE_META[lead.source] ?? SOURCE_META.other;
  const SourceIcon = sourceMeta.icon;
  const statusMeta = STATUS_META[lead.status] ?? STATUS_META.new;

  return (
    <tr
      className={cn(
        "transition-colors",
        coche ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-stone-50",
      )}
    >
      <td className="w-10 pl-4 pr-1 py-3 align-top">
        <input
          type="checkbox"
          aria-label={`Sélectionner ${lead.full_name || lead.email || "ce lead"}`}
          checked={coche}
          onChange={(e) => onBasculer(index, avecMaj(e))}
          className="mt-1 h-4 w-4 cursor-pointer accent-primary"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold",
            sourceMeta.color,
          )}
        >
          <SourceIcon className="h-3 w-3" />
          {sourceMeta.label}
        </span>
      </td>
      <td className="px-4 py-3 align-top">
        <div className="font-medium text-secondary">
          {lead.full_name || (
            <span className="text-neutral-400 italic">Anonyme</span>
          )}
        </div>
        {lead.source_url && (
          <div className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-[180px]">
            {lead.source_url}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="space-y-0.5">
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[180px]">{lead.email}</span>
            </a>
          )}
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-primary transition-colors"
            >
              <Phone className="h-3 w-3 shrink-0" />
              {lead.phone}
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-3 align-top max-w-xs">
        {lead.bien?.name && (
          <div className="text-xs text-neutral-500 mb-1 inline-flex items-center gap-1">
            <Home className="h-3 w-3" />
            {lead.bien.name}
          </div>
        )}
        {lead.message && (
          <div className="text-xs text-neutral-700 line-clamp-2">
            {lead.message}
          </div>
        )}
        {!lead.message && !lead.bien?.name && (
          <span className="text-xs text-neutral-400 italic">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-top text-xs text-neutral-600 whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3 text-neutral-400" />
          {formatDate(lead.created_at)}
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            statusMeta.color,
          )}
        >
          {statusMeta.label}
        </span>
      </td>
      <td className="px-4 py-3 align-top text-right">
        <div className="inline-flex items-center gap-1">
          <Link
            href={`/admin/leads/${lead.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-stone-200 hover:bg-stone-50 text-neutral-700 px-2.5 py-1 text-xs font-medium"
          >
            Détail
            <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            disabled={occupe}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 disabled:opacity-40"
            aria-label="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
});
