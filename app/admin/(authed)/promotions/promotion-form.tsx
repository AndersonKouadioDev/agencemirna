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
import {
  upsertPromotion,
  type PromotionAdminRow,
} from "@/src/actions/admin/promotions";

export function PromotionForm({ promo }: { promo?: PromotionAdminRow }) {
  const router = useRouter();
  const isEdit = !!promo;

  const [title, setTitle] = React.useState(promo?.title ?? "");
  const [description, setDescription] = React.useState(
    promo?.description ?? "",
  );
  const [imageUrls, setImageUrls] = React.useState<string[]>(
    promo?.image && promo.image.startsWith("/images/") ? [] : promo?.image ? [promo.image] : [],
  );
  // URL alternative — pour réutiliser une image existante (ex: /images/biens/bien1.jpg)
  // sans avoir à re-uploader. Pratique pour les promos test ou les visuels génériques.
  const [imageAltUrl, setImageAltUrl] = React.useState<string>(
    promo?.image && promo.image.startsWith("/images/") ? promo.image : "",
  );
  const [ctaLabel, setCtaLabel] = React.useState(promo?.cta_label ?? "");
  const [ctaUrl, setCtaUrl] = React.useState(promo?.cta_url ?? "");
  const [startsAt, setStartsAt] = React.useState(
    promo?.starts_at ? toDateTimeLocal(promo.starts_at) : "",
  );
  const [endsAt, setEndsAt] = React.useState(
    promo?.ends_at ? toDateTimeLocal(promo.ends_at) : "",
  );
  const [showOnHome, setShowOnHome] = React.useState(
    promo?.show_on_home ?? false,
  );
  const [isActive, setIsActive] = React.useState(promo?.is_active ?? true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pathPrefix = React.useMemo(() => {
    if (promo?.id) return `promotions/${promo.id}`;
    return `promotions/draft-${typeof crypto !== "undefined" ? crypto.randomUUID().slice(0, 8) : Date.now()}`;
  }, [promo?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Image : upload prioritaire, sinon URL alternative, sinon erreur
    const finalImage = imageUrls[0] || imageAltUrl.trim();
    if (!finalImage) {
      setError(
        "Une image est obligatoire — uploadez un fichier OU collez une URL d'image existante.",
      );
      setSubmitting(false);
      return;
    }

    const result = await upsertPromotion({
      id: promo?.id,
      title,
      description: description || null,
      image: finalImage,
      cta_label: ctaLabel || null,
      cta_url: ctaUrl || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      show_on_home: showOnHome,
      is_active: isActive,
      ordre: promo?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/promotions?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 hover:bg-stone-100 text-neutral-600"
          >
            <Link href="/admin/promotions" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Retour aux promotions
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? title || "(sans titre)" : "Nouvelle promotion"}
          </h1>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting ? "…" : isEdit ? "Enregistrer" : "Créer la promotion"}
          </span>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Contenu de la promotion">
            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Nouvelle résidence à Cocody — 10% de remise"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Le texte affiché sous l'image"
                rows={4}
              />
            </Field>
          </Section>

          <Section
            title="Image"
            subtitle="Visuel principal affiché sur la page /promotions et (si activé) en bandeau sur la home. Format conseillé : carré ou rectangle 16/9."
          >
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              pathPrefix={pathPrefix}
              maxFiles={1}
            />

            {/* Alternative : URL d'image existante (réutilise un visuel
                déjà présent dans /public ou Supabase Storage). Utile pour
                des promos rapides sans upload dédié. */}
            <div className="mt-4 pt-4 border-t border-stone-200">
              <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2 block">
                Ou réutiliser une image existante (URL)
              </Label>
              <Input
                value={imageAltUrl}
                onChange={(e) => setImageAltUrl(e.target.value)}
                placeholder="Ex : /images/biens/bien1.jpg ou https://…"
                className="text-sm"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Laissez vide si vous uploadez une image ci-dessus. Sinon,
                collez le chemin d'une image déjà présente sur le site.
              </p>
            </div>
          </Section>

          <Section
            title="Bouton d'action"
            subtitle="Optionnel — pour rediriger vers une page, un bien, un formulaire…"
          >
            <Field label="Libellé du bouton">
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Découvrir l'offre"
              />
            </Field>
            <Field label="Lien (URL)">
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="/properties ou https://…"
              />
            </Field>
          </Section>
        </div>

        {/* Droite (1/3) */}
        <div className="space-y-6">
          <Section title="Publication">
            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md p-2 -m-2 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="flex-1">
                <span
                  className={`block text-sm font-medium ${isActive ? "text-neutral-900" : "text-neutral-500"}`}
                >
                  {isActive ? "Promotion active" : "Promotion désactivée"}
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  {isActive
                    ? "Visible sur /promotions (dans la plage de dates si définie)"
                    : "Brouillon, masquée du site"}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md p-2 -m-2 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-neutral-900">
                  Afficher sur la home
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  Met en avant cette promo dans le bandeau de la page d'accueil.
                </span>
              </span>
            </label>
          </Section>

          <Section
            title="Période d'affichage"
            subtitle="Dates auxquelles la promotion sera visible sur le site (laisser vide = toujours actif)"
          >
            <Field label="Début">
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </Field>
            <Field label="Fin">
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </Field>
            <Hint>
              Si vide → toujours visible (tant que la promo est active).
            </Hint>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/85 backdrop-blur border-t border-stone-200 px-6 lg:px-8 py-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          asChild
          className="hover:bg-stone-100 border-stone-200"
        >
          <Link href="/admin/promotions">Annuler</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer la promotion"}
          </span>
        </Button>
      </div>
    </form>
  );
}

// ---------- Helpers ----------

function toDateTimeLocal(iso: string): string {
  // Converti une date ISO en format datetime-local (YYYY-MM-DDTHH:mm)
  // pour pré-remplir l'input HTML.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
      <header>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
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
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-neutral-500 mt-1">{children}</p>;
}
