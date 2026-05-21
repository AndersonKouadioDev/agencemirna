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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteLead, type LeadRow } from "@/src/actions/admin/leads";

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

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onDelete(id: string) {
    if (!confirm("Supprimer ce lead ? Action irréversible.")) return;
    setBusy(id);
    await deleteLead(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-xs uppercase tracking-wider text-neutral-500">
          <tr>
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
          {leads.map((lead) => {
            const sourceMeta = SOURCE_META[lead.source] ?? SOURCE_META.other;
            const SourceIcon = sourceMeta.icon;
            const statusMeta = STATUS_META[lead.status] ?? STATUS_META.new;

            return (
              <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
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
                      <span className="text-neutral-400 italic">
                        Anonyme
                      </span>
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
                        <span className="truncate max-w-[180px]">
                          {lead.email}
                        </span>
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
                      disabled={busy === lead.id}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 disabled:opacity-40"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
