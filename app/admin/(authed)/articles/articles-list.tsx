"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteArticle,
  toggleArticleActive,
  type ArticleRow,
} from "@/src/actions/admin/content";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticlesList({ items }: { items: ArticleRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onToggle(id: string, current: boolean) {
    setBusy(id);
    await toggleArticleActive(id, !current);
    setBusy(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer cet article ? Action irréversible.")) return;
    setBusy(id);
    await deleteArticle(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((a) => (
        <article
          key={a.id}
          className={cn(
            "rounded-2xl border bg-white overflow-hidden transition-all",
            a.is_active ? "border-stone-200" : "border-stone-200 opacity-60",
          )}
        >
          <div className="relative aspect-[16/9] bg-stone-100">
            <Image
              src={a.image}
              alt={a.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {a.category && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {a.category}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(a.published_at)}
              </span>
              {a.read_time_minutes && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {a.read_time_minutes} min
                  </span>
                </>
              )}
            </div>

            <h3 className="font-semibold text-secondary leading-snug mb-2 line-clamp-2">
              {a.title}
            </h3>

            {a.excerpt && (
              <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                {a.excerpt}
              </p>
            )}

            <footer className="flex items-center justify-between border-t border-stone-100 pt-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={a.is_active}
                  disabled={busy === a.id}
                  onChange={() => onToggle(a.id, a.is_active)}
                  className="h-4 w-4 rounded border-stone-300 text-primary"
                />
                {a.is_active ? "Publié" : "Brouillon"}
              </label>
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/articles/${a.id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50 text-neutral-600"
                  aria-label="Éditer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(a.id)}
                  disabled={busy === a.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 disabled:opacity-40"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </footer>
          </div>
        </article>
      ))}
    </div>
  );
}
