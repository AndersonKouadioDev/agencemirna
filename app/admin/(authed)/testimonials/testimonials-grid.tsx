"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteTestimonial,
  toggleTestimonialActive,
  type TestimonialRow,
} from "@/src/actions/admin/content";

export function TestimonialsGrid({ items }: { items: TestimonialRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onToggle(id: string, current: boolean) {
    setBusy(id);
    await toggleTestimonialActive(id, !current);
    setBusy(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer ce témoignage ? Action irréversible.")) return;
    setBusy(id);
    await deleteTestimonial(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((t) => (
        <article
          key={t.id}
          className={cn(
            "rounded-2xl border bg-white p-5 transition-all",
            t.is_active
              ? "border-stone-200"
              : "border-stone-200 opacity-60",
          )}
        >
          <header className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {t.avatar_initials ?? initialsFromName(t.author_name)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-secondary truncate">
                  {t.author_name}
                </div>
                {t.author_role && (
                  <div className="text-xs text-neutral-500 truncate">
                    {t.author_role}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: t.rating }).map((_, k) => (
                <Star
                  key={k}
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                />
              ))}
            </div>
          </header>

          <p className="text-sm text-neutral-700 line-clamp-4 mb-4">
            « {t.quote} »
          </p>

          <footer className="flex items-center justify-between border-t border-stone-100 pt-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={t.is_active}
                disabled={busy === t.id}
                onChange={() => onToggle(t.id, t.is_active)}
                className="h-4 w-4 rounded border-stone-300 text-primary"
              />
              {t.is_active ? "En ligne" : "Brouillon"}
            </label>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/testimonials/${t.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50 text-neutral-600"
                aria-label="Éditer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(t.id)}
                disabled={busy === t.id}
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

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
