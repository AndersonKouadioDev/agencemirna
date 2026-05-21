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
  upsertTestimonial,
  type TestimonialRow,
} from "@/src/actions/admin/content";

export function TestimonialForm({ row }: { row?: TestimonialRow }) {
  const router = useRouter();
  const isEdit = !!row;

  const [quote, setQuote] = React.useState(row?.quote ?? "");
  const [authorName, setAuthorName] = React.useState(row?.author_name ?? "");
  const [authorRole, setAuthorRole] = React.useState(row?.author_role ?? "");
  const [initials, setInitials] = React.useState(row?.avatar_initials ?? "");
  const [rating, setRating] = React.useState(row?.rating ?? 5);
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertTestimonial({
      id: row?.id,
      quote,
      author_name: authorName,
      author_role: authorRole || null,
      avatar_initials: initials || null,
      rating,
      is_active: isActive,
      ordre: row?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/testimonials?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux témoignages
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {isEdit ? "Enregistrer les modifications" : "Créer le témoignage"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? row?.author_name : "Nouveau témoignage"}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Contenu</h2>

            <Field label="Témoignage" required>
              <Textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Mon expérience avec l'Agence Mirna..."
                rows={6}
                required
              />
            </Field>

            <Field label="Nom de l'auteur" required>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex : Aïcha K."
                required
              />
            </Field>

            <Field label="Rôle / contexte">
              <Input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Ex : Propriétaire bailleur · Marcory Zone 4"
              />
            </Field>

            <Field label="Initiales avatar (2 lettres max)">
              <Input
                value={initials}
                onChange={(e) =>
                  setInitials(e.target.value.toUpperCase().slice(0, 2))
                }
                placeholder="AK"
                maxLength={2}
                className="w-24"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Laissez vide pour générer automatiquement depuis le nom.
              </p>
            </Field>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Note</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      star <= rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-stone-300",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-neutral-600">
                {rating} / 5
              </span>
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
                  Témoignage actif
                </span>
                <span className="block text-xs text-neutral-500">
                  Visible dans le carousel de la home si coché.
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
