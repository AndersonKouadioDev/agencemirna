"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../../_components/image-uploader";
import {
  upsertService,
  type ServiceAdminRow,
} from "@/src/actions/admin/services";

/**
 * Form d'édition d'un service.
 * - slug & ID sont non-éditables (affichés en read-only)
 * - Tous les autres champs sont libres
 * - Highlights : éditeur de liste dynamique (add/remove/edit)
 * - Image : ImageUploader (1 seule image)
 */
export function ServiceForm({ service }: { service: ServiceAdminRow }) {
  const router = useRouter();

  const [name, setName] = React.useState(service.name);
  const [shortDesc, setShortDesc] = React.useState(
    service.short_description ?? "",
  );
  const [longDesc, setLongDesc] = React.useState(
    service.long_description ?? "",
  );
  const [icon, setIcon] = React.useState(service.icon ?? "");
  const [ctaLabel, setCtaLabel] = React.useState(service.cta_label ?? "");
  const [ctaUrl, setCtaUrl] = React.useState(service.cta_url ?? "");
  const [highlights, setHighlights] = React.useState<string[]>(
    service.highlights.length > 0 ? service.highlights : [""],
  );
  const [imageUrls, setImageUrls] = React.useState<string[]>(
    service.image ? [service.image] : [],
  );
  const [isActive, setIsActive] = React.useState(service.is_active);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertService({
      id: service.id,
      name,
      short_description: shortDesc || null,
      long_description: longDesc || null,
      icon: icon || null,
      image: imageUrls[0] ?? null,
      highlights: highlights.filter((h) => h.trim().length > 0),
      cta_label: ctaLabel || null,
      cta_url: ctaUrl || null,
      ordre: service.ordre,
      is_active: isActive,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/admin/services?flash=updated");
  }

  function addHighlight() {
    setHighlights((prev) => [...prev, ""]);
  }

  function removeHighlight(i: number) {
    setHighlights((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateHighlight(i: number, value: string) {
    setHighlights((prev) => prev.map((h, idx) => (idx === i ? value : h)));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 hover:bg-stone-100 text-neutral-600"
          >
            <Link
              href="/admin/services"
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux services
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-neutral-500">
              /services/{service.slug}
            </span>
            {service.is_active && (
              <Link
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Voir
              </Link>
            )}
          </div>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </span>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : contenus textuels (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Contenus">
            <Field label="Nom du service" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Vente de biens immobiliers"
              />
            </Field>

            <Field label="Description courte">
              <Input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Une phrase qui résume le service (sur les cards)"
                maxLength={200}
              />
              <Hint>{shortDesc.length}/200 caractères</Hint>
            </Field>

            <Field label="Description complète">
              <Textarea
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                placeholder="Présentation détaillée affichée sur la page /services/[slug]"
                rows={6}
              />
            </Field>
          </Section>

          <Section
            title="Points clés"
            subtitle="Liste de bénéfices affichés sous la description (✓ checkmarks)"
          >
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={h}
                    onChange={(e) => updateHighlight(i, e.target.value)}
                    placeholder={`Point clé ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighlight(i)}
                    className="shrink-0 h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer ce point clé"
                    disabled={highlights.length === 1 && !h}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHighlight}
              className="hover:bg-stone-100 border-stone-200"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">Ajouter un point clé</span>
            </Button>
          </Section>

          <Section
            title="Image de présentation"
            subtitle="Une seule image utilisée sur les cards services et en hero de la page dédiée"
          >
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              pathPrefix={`services/${service.slug}`}
              maxFiles={1}
            />
          </Section>
        </div>

        {/* Colonne droite : config (1/3) */}
        <div className="space-y-6">
          <Section
            title="Publication"
            subtitle="Activer ou désactiver l'affichage du service sur le site."
          >
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
                  {isActive ? "Service actif (visible)" : "Service désactivé"}
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  {isActive
                    ? "Visible sur /services et dans le footer"
                    : "Masqué du site public"}
                </span>
              </span>
            </label>
          </Section>

          <Section
            title="Icône"
            subtitle="Nom d'icône Lucide React (ex: Home, Building2, KeyRound, Palette, HardHat, Landmark)"
          >
            <Field label="Nom de l'icône">
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Home"
                className="font-mono"
              />
              <Hint>
                Voir{" "}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  lucide.dev/icons
                </a>{" "}
                pour la liste complète
              </Hint>
            </Field>
          </Section>

          <Section
            title="Bouton d'action (CTA)"
            subtitle="Bouton affiché en bas de la page service"
          >
            <Field label="Libellé du bouton">
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Demander un devis"
              />
            </Field>
            <Field label="Lien (URL)">
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="/contact_us"
              />
              <Hint>Chemin interne (/contact_us) ou URL externe (https://…)</Hint>
            </Field>
          </Section>
        </div>
      </div>

      {/* Footer sticky */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/85 backdrop-blur border-t border-stone-200 px-6 lg:px-8 py-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          asChild
          className="hover:bg-stone-100 border-stone-200"
        >
          <Link href="/admin/services">Annuler</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting ? "Enregistrement…" : "Enregistrer les modifications"}
          </span>
        </Button>
      </div>
    </form>
  );
}

// ---------- Sous-composants présentation ----------

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
