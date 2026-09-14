
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import {
  AnnonceFormData,
  AnnonceAdminRow,
  upsertAnnonceAndRedirect,
} from "@/src/actions/admin/annonces";

export function AnnonceForm({ promo }: { promo?: AnnonceAdminRow }) {
  const isEdit = !!promo;

  const [title, setTitle] = useState(promo?.title || "");
  const [imageAltUrl, setImageAltUrl] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<string[]>(
    promo?.image ? [promo.image] : [],
  );

  const [ctaLabel, setCtaLabel] = useState(promo?.cta_label || "");
  const [ctaUrl, setCtaUrl] = useState(promo?.cta_url || "");
  const [startsAt, setStartsAt] = useState(
    promo?.starts_at ? toDateTimeLocal(promo.starts_at) : "",
  );
  const [endsAt, setEndsAt] = useState(
    promo?.ends_at ? toDateTimeLocal(promo.ends_at) : "",
  );
  const [showOnHome, setShowOnHome] = useState(promo?.show_on_home ?? false);
  const [isActive, setIsActive] = useState(promo?.is_active ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsing du JSON depuis la description pour récupérer les champs avancés
  let defaultType = "PROMOTION";
  let defaultPrice = "";
  let defaultOldPrice = "";
  let defaultSubtitle = "";

  try {
    if (promo?.description) {
      if (promo.description.startsWith("{")) {
        const parsed = JSON.parse(promo.description);
        defaultType = parsed.type || "PROMOTION";
        defaultPrice = parsed.price || "";
        defaultOldPrice = parsed.oldPrice || "";
        defaultSubtitle = parsed.subtitle || "";
      } else {
        defaultSubtitle = promo.description;
      }
    }
  } catch (e) {
    defaultSubtitle = promo?.description || "";
  }

  const [annonceType, setAnnonceType] = useState(defaultType);
  const [price, setPrice] = useState(defaultPrice);
  const [oldPrice, setOldPrice] = useState(defaultOldPrice);
  const [subtitle, setSubtitle] = useState(defaultSubtitle);

  const pathPrefix = "annonces"; // storage folder

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalImage = imageUrls[0] || imageAltUrl.trim();
    if (!finalImage) {
      setError("Vous devez uploader une image ou fournir une URL existante.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    const descriptionPayload = JSON.stringify({
      type: annonceType,
      price,
      oldPrice,
      subtitle
    });

    const data: AnnonceFormData = {
      id: promo?.id,
      title: title.trim(),
      description: descriptionPayload,
      image: finalImage,
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      show_on_home: showOnHome,
      is_active: isActive,
      ordre: promo?.ordre,
    };

    const result = await upsertAnnonceAndRedirect(data);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-4xl pt-6 pb-24 px-6 lg:px-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8 text-neutral-500 hover:text-neutral-900 shrink-0"
        >
          <Link href="/admin/annonces">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-neutral-400" />
            {isEdit ? "Modifier l'annonce" : "Nouvelle annonce / opportunité"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Les annonces apparaîtront sur la page /annonces et sur la home si vous cochez l'option.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Informations de l'annonce">
            <Field label="Type d'annonce" required>
              <select
                value={annonceType}
                onChange={(e) => setAnnonceType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="PROMOTION">PROMOTION</option>
                <option value="NOUVEAU">NOUVEAU</option>
                <option value="EXCLUSIVITÉ">EXCLUSIVITÉ</option>
                <option value="OPPORTUNITÉ">OPPORTUNITÉ</option>
              </select>
            </Field>

            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Villa Duplex avec Piscine - Riviera 4"
              />
            </Field>

            <Field label="Sous-titre / Court message">
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Dernier lot disponible ou Réduit de 15%"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Prix / Nouveau Prix">
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 297.500.000 FCFA"
                />
              </Field>
              <Field label="Ancien Prix (Optionnel)">
                <Input
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="Ex: 350.000.000 FCFA"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Image"
            subtitle="Visuel principal affiché sur la carte. Format conseillé : 4/3 ou 16/9."
          >
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              pathPrefix={pathPrefix}
              maxFiles={1}
            />

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
            </div>
          </Section>

          <Section
            title="Lien (Call to action)"
            subtitle="Le bouton qui s'affiche sur la carte pour rediriger vers le bien concerné."
          >
            <Field label="Libellé du bouton (Optionnel)">
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
                placeholder="/properties/id-du-bien"
              />
            </Field>
          </Section>
        </div>

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
                  {isActive ? "Annonce active" : "Annonce désactivée"}
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  {isActive
                    ? "Visible sur /annonces (dans la plage de dates si définie)"
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
                  Met en avant cette promo dans le bandeau défilant de la home.
                </span>
              </span>
            </label>
          </Section>

          <Section
            title="Période d'affichage"
            subtitle="Dates auxquelles l'annonce sera visible sur le site (laisser vide = toujours actif)"
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
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/85 backdrop-blur border-t border-stone-200 px-6 lg:px-8 py-3 flex justify-end gap-2 z-10">
        <Button
          type="button"
          variant="outline"
          asChild
          className="hover:bg-stone-100 border-stone-200"
        >
          <Link href="/admin/annonces">Annuler</Link>
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-secondary hover:bg-[#D4981C]">
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
                : "Créer l'annonce"}
          </span>
        </Button>
      </div>
    </form>
  );
}

function toDateTimeLocal(iso: string): string {
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
