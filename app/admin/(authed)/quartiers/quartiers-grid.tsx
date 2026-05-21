"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteQuartier,
  toggleQuartierActive,
  toggleQuartierFeatured,
  type QuartierRow,
} from "@/src/actions/admin/quartiers";

export function QuartiersGrid({ items }: { items: QuartierRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onToggleActive(id: string, current: boolean) {
    setBusy(id);
    await toggleQuartierActive(id, !current);
    setBusy(null);
    router.refresh();
  }

  async function onToggleFeatured(id: string, current: boolean) {
    setBusy(id);
    await toggleQuartierFeatured(id, !current);
    setBusy(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer ce quartier ? Action irréversible.")) return;
    setBusy(id);
    await deleteQuartier(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((q) => (
        <article
          key={q.id}
          className={cn(
            "rounded-2xl border bg-white overflow-hidden transition-all",
            q.is_active ? "border-stone-200" : "border-stone-200 opacity-60",
          )}
        >
          <div className="relative aspect-[4/5] bg-stone-100">
            <Image
              src={q.image}
              alt={q.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent" />

            {q.badge && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {q.badge}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onToggleFeatured(q.id, q.is_featured)}
              disabled={busy === q.id}
              className={cn(
                "absolute top-3 right-3 h-8 w-8 rounded-full border flex items-center justify-center transition-colors",
                q.is_featured
                  ? "bg-amber-500 border-amber-600 text-white"
                  : "bg-white/90 border-stone-300 text-neutral-500 hover:text-amber-500",
              )}
              title={q.is_featured ? "Mis en avant sur la home" : "Mettre en avant"}
            >
              <Star className={cn("h-4 w-4", q.is_featured && "fill-current")} />
            </button>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
                <MapPin className="h-3 w-3" />
                {q.commune}
              </div>
              <div className="font-agate text-xl font-bold">{q.name}</div>
              {q.tagline && (
                <div className="text-xs text-primary font-medium mt-0.5">
                  {q.tagline}
                </div>
              )}
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-stone-100 p-3">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={q.is_active}
                disabled={busy === q.id}
                onChange={() => onToggleActive(q.id, q.is_active)}
                className="h-3.5 w-3.5 rounded border-stone-300 text-primary"
              />
              {q.is_active ? "En ligne" : "Brouillon"}
            </label>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/quartiers/${q.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50 text-neutral-600"
                aria-label="Éditer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(q.id)}
                disabled={busy === q.id}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 disabled:opacity-40"
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}
