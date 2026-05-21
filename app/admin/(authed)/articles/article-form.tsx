"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../../_components/image-uploader";
import { upsertArticle, type ArticleRow } from "@/src/actions/admin/content";

function toDateInput(iso?: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function ArticleForm({ row }: { row?: ArticleRow }) {
  const router = useRouter();
  const isEdit = !!row;

  const [title, setTitle] = React.useState(row?.title ?? "");
  const [slug, setSlug] = React.useState(row?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(row?.excerpt ?? "");
  const [contentMd, setContentMd] = React.useState(row?.content_md ?? "");
  const [category, setCategory] = React.useState(row?.category ?? "");
  const [readTime, setReadTime] = React.useState<string>(
    row?.read_time_minutes?.toString() ?? "5",
  );
  const [publishedAt, setPublishedAt] = React.useState(
    toDateInput(row?.published_at),
  );
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);

  const [imageUrls, setImageUrls] = React.useState<string[]>(
    row?.image && row.image.startsWith("/images/") ? [] : row?.image ? [row.image] : [],
  );
  const [imageAlt, setImageAlt] = React.useState(
    row?.image && row.image.startsWith("/images/") ? row.image : "",
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pathPrefix = React.useMemo(() => {
    if (row?.id) return `articles/${row.id}`;
    return `articles/draft-${typeof crypto !== "undefined" ? crypto.randomUUID().slice(0, 8) : Date.now()}`;
  }, [row?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const finalImage = imageUrls[0] || imageAlt.trim();
    if (!finalImage) {
      setError("Une image est obligatoire (upload ou URL existante).");
      setSubmitting(false);
      return;
    }

    const result = await upsertArticle({
      id: row?.id,
      slug,
      title,
      excerpt: excerpt || null,
      content_md: contentMd || null,
      image: finalImage,
      category: category || null,
      read_time_minutes: readTime ? parseInt(readTime, 10) : null,
      published_at: publishedAt
        ? new Date(publishedAt).toISOString()
        : null,
      is_active: isActive,
      ordre: row?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/articles?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {isEdit ? "Enregistrer" : "Publier l'article"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? row?.title : "Nouvel article"}
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

            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Top 5 quartiers où investir à Abidjan en 2026"
                required
              />
            </Field>

            <Field label="Slug (URL)">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-généré depuis le titre si vide"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Utilisé pour la future URL /actualites/[slug]. Laissez vide
                pour génération automatique.
              </p>
            </Field>

            <Field label="Extrait (chapô)">
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé court affiché sur la card du blog (3 lignes)."
                rows={3}
              />
            </Field>

            <Field label="Contenu (markdown)">
              <Textarea
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                placeholder="Contenu complet de l'article (markdown supporté)."
                rows={12}
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Pour le moment uniquement stocké en base. L'affichage
                complet de l'article arrivera dans une page dédiée.
              </p>
            </Field>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Image de couverture</h2>
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              pathPrefix={pathPrefix}
              maxFiles={1}
            />
            <div className="pt-4 border-t border-stone-200">
              <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2 block">
                Ou réutiliser une image existante (URL)
              </Label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Ex : /images/biens/bien15.jpg"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Méta</h2>

            <Field label="Catégorie">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex : Guide propriétaire"
              />
            </Field>

            <Field label="Temps de lecture (minutes)">
              <Input
                type="number"
                min={1}
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
              />
            </Field>

            <Field label="Date de publication">
              <Input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </Field>
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
                  Article publié
                </span>
                <span className="block text-xs text-neutral-500">
                  Visible dans le blog public si coché.
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
