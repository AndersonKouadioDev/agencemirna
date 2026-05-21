"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteFaq,
  toggleFaqActive,
  type FaqRow,
} from "@/src/actions/admin/content";

export function FaqsList({ items }: { items: FaqRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [openId, setOpenId] = React.useState<string | null>(null);

  async function onToggle(id: string, current: boolean) {
    setBusy(id);
    await toggleFaqActive(id, !current);
    setBusy(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer cette question ? Action irréversible.")) return;
    setBusy(id);
    await deleteFaq(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white divide-y divide-stone-200 overflow-hidden">
      {items.map((f) => {
        const isOpen = openId === f.id;
        return (
          <div key={f.id} className={cn(!f.is_active && "opacity-60")}>
            <div className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : f.id)}
                className="flex-1 flex items-center gap-3 text-left min-w-0"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
                    isOpen && "rotate-180 text-primary",
                  )}
                />
                <span className="text-sm font-medium text-neutral-900 truncate">
                  {f.question}
                </span>
              </button>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={f.is_active}
                  disabled={busy === f.id}
                  onChange={() => onToggle(f.id, f.is_active)}
                  className="h-3.5 w-3.5 rounded border-stone-300 text-primary"
                />
                {f.is_active ? "En ligne" : "Brouillon"}
              </label>
              <Link
                href={`/admin/faqs/${f.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50 text-neutral-600"
                aria-label="Éditer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(f.id)}
                disabled={busy === f.id}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 disabled:opacity-40"
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {isOpen && (
              <div className="bg-stone-50 px-4 pb-4 pl-11 -mt-1">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {f.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
