"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Heart,
  Star,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteSocialMention,
  toggleSocialMentionActive,
  type SocialMentionRow,
} from "@/src/actions/admin/content";

const NETWORK_META: Record<string, { icon: typeof Facebook; bg: string }> = {
  facebook: { icon: Facebook, bg: "bg-blue-500" },
  instagram: { icon: Instagram, bg: "bg-gradient-to-br from-pink-500 to-purple-500" },
  google: { icon: Star, bg: "bg-amber-500" },
  linkedin: { icon: Linkedin, bg: "bg-sky-600" },
  twitter: { icon: Facebook, bg: "bg-sky-400" },
  youtube: { icon: Youtube, bg: "bg-red-600" },
};

export function MentionsList({ items }: { items: SocialMentionRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onToggle(id: string, current: boolean) {
    setBusy(id);
    await toggleSocialMentionActive(id, !current);
    setBusy(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer cette mention ? Action irréversible.")) return;
    setBusy(id);
    await deleteSocialMention(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((m) => {
        const meta = NETWORK_META[m.network] ?? NETWORK_META.facebook;
        const Icon = meta.icon;
        return (
          <article
            key={m.id}
            className={cn(
              "rounded-2xl border bg-white p-4 transition-all",
              m.is_active ? "border-stone-200" : "border-stone-200 opacity-60",
            )}
          >
            <header className="flex items-center gap-3 mb-2">
              <div
                className={`h-9 w-9 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-secondary truncate">
                  {m.author_name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate capitalize">
                  {m.author_handle ? `${m.author_handle} · ` : ""}
                  {m.network}
                </div>
              </div>
              {m.rating != null && (
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: m.rating }).map((_, k) => (
                    <Star
                      key={k}
                      className="h-3 w-3 fill-amber-500 text-amber-500"
                    />
                  ))}
                </div>
              )}
            </header>

            <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3 mb-3">
              {m.text}
            </p>

            <footer className="flex items-center justify-between border-t border-stone-100 pt-3">
              <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                {m.date_label && <span>{m.date_label}</span>}
                {m.likes != null && (
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {m.likes}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-neutral-600 mr-1">
                  <input
                    type="checkbox"
                    checked={m.is_active}
                    disabled={busy === m.id}
                    onChange={() => onToggle(m.id, m.is_active)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-primary"
                  />
                  {m.is_active ? "En ligne" : "Brouillon"}
                </label>
                <Link
                  href={`/admin/social-mentions/${m.id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50 text-neutral-600"
                  aria-label="Éditer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(m.id)}
                  disabled={busy === m.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 disabled:opacity-40"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
