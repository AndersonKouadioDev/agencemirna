"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateLeadStatus, type LeadStatus } from "@/src/actions/admin/leads";

const STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "Nouveau", color: "border-amber-200 bg-amber-50 text-amber-800" },
  {
    value: "in_progress",
    label: "En cours",
    color: "border-blue-200 bg-blue-50 text-blue-800",
  },
  {
    value: "qualified",
    label: "Qualifié",
    color: "border-purple-200 bg-purple-50 text-purple-800",
  },
  {
    value: "converted",
    label: "Converti",
    color: "border-green-200 bg-green-50 text-green-800",
  },
  {
    value: "rejected",
    label: "Rejeté",
    color: "border-red-200 bg-red-50 text-red-800",
  },
  {
    value: "archived",
    label: "Archivé",
    color: "border-neutral-200 bg-neutral-100 text-neutral-700",
  },
];

export function LeadActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: LeadStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<LeadStatus | null>(null);
  const [status, setStatus] = React.useState<LeadStatus>(currentStatus);

  async function onChange(next: LeadStatus) {
    if (next === status) return;
    setBusy(next);
    const res = await updateLeadStatus(id, next);
    setBusy(null);
    if (res.ok) {
      setStatus(next);
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
        Statut
      </h3>
      <div className="space-y-2">
        {STATUSES.map((s) => {
          const isActive = status === s.value;
          const isBusy = busy === s.value;
          return (
            <button
              key={s.value}
              type="button"
              disabled={isBusy}
              onClick={() => onChange(s.value)}
              className={cn(
                "w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? s.color
                  : "border-stone-200 text-neutral-700 hover:border-stone-300 hover:bg-stone-50",
                isBusy && "opacity-60",
              )}
            >
              <span>{s.label}</span>
              {isBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isActive ? (
                <Check className="h-3.5 w-3.5" />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
