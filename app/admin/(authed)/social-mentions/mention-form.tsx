"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  upsertSocialMention,
  type SocialMentionRow,
} from "@/src/actions/admin/content";

const NETWORKS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google Reviews" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
];

export function MentionForm({ row }: { row?: SocialMentionRow }) {
  const router = useRouter();
  const isEdit = !!row;

  const [network, setNetwork] = React.useState(row?.network ?? "facebook");
  const [authorName, setAuthorName] = React.useState(row?.author_name ?? "");
  const [authorHandle, setAuthorHandle] = React.useState(row?.author_handle ?? "");
  const [text, setText] = React.useState(row?.text ?? "");
  const [dateLabel, setDateLabel] = React.useState(row?.date_label ?? "");
  const [likes, setLikes] = React.useState<string>(row?.likes?.toString() ?? "");
  const [rating, setRating] = React.useState<number | null>(row?.rating ?? null);
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertSocialMention({
      id: row?.id,
      network,
      author_name: authorName,
      author_handle: authorHandle || null,
      text,
      date_label: dateLabel || null,
      likes: likes ? parseInt(likes, 10) : null,
      rating: rating ?? null,
      is_active: isActive,
      ordre: row?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/social-mentions?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/social-mentions"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux mentions
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {isEdit ? "Enregistrer" : "Créer la mention"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? `${row?.author_name} · ${row?.network}` : "Nouvelle mention sociale"}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <Field label="Réseau" required>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                required
              >
                {NETWORKS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nom de l'auteur" required>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex : Aïcha K."
                required
              />
            </Field>

            <Field label="Handle / sous-titre">
              <Input
                value={authorHandle}
                onChange={(e) => setAuthorHandle(e.target.value)}
                placeholder="Ex : @aicha_k ou Marcory Zone 4 ou Google Reviews"
              />
            </Field>

            <Field label="Texte de la mention" required>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex : Service impeccable, locataires trouvés en 2 semaines..."
                rows={5}
                required
              />
            </Field>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Méta</h2>
            <Field label="Date affichée (texte libre)">
              <Input
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder="Ex : Il y a 3 jours"
              />
            </Field>

            <Field label="Likes (Facebook / Instagram)">
              <Input
                type="number"
                min={0}
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                placeholder="Optionnel"
              />
            </Field>

            <div>
              <Label className="mb-2 block">Note étoiles (Google)</Label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-xs text-neutral-500 mr-2 hover:text-red-600"
                >
                  aucune
                </button>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        "h-5 w-5 transition-colors",
                        rating != null && s <= rating
                          ? "fill-amber-500 text-amber-500"
                          : "text-stone-300",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-secondary">Publication</h2>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  Mention active
                </span>
                <span className="block text-xs text-neutral-500">
                  Visible dans le bloc "On parle de nous" sur la home.
                </span>
              </span>
            </label>
          </section>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
