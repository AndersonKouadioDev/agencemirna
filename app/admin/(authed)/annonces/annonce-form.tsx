
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
  BienOption,
  TypeAnnonce,
  upsertAnnonceAndRedirect,
} from "@/src/actions/admin/annonces";

export function AnnonceForm({
  promo,
  types = [],
  biens = [],
}: {
  promo?: AnnonceAdminRow;
  types?: TypeAnnonce[];
  biens?: BienOption[];
}) {
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

  // L'annonce ne porte plus que ce qui lui est propre : le prix et les
  // caractéristiques sont lus sur le bien mis en avant, au lieu d'être
  // ressaisis (ils étaient jusqu'ici empaquetés en JSON dans `description`).
  const [typeId, setTypeId] = useState<string>(
    promo?.type_annonce_id?.toString() ?? "",
  );
  const [bienId, setBienId] = useState<string>(promo?.bien_id ?? "");
  const [subtitle, setSubtitle] = useState(promo?.sous_titre ?? "");
  const [description, setDescription] = useState(promo?.description ?? "");
  const [bienQuery, setBienQuery] = useState("");

  const bienSelectionne = React.useMemo(
    () => biens.find((b) => b.id === bienId) ?? null,
    [biens, bienId],
  );

  const biensFiltres = React.useMemo(() => {
    const q = bienQuery.trim().toLowerCase();
    if (!q) return biens.slice(0, 40);
    return biens
      .filter((b) =>
        [b.name, b.ville_commune]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 40);
  }, [biens, bienQuery]);

  const pathPrefix = "annonces"; // storage folder

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!bienId) {
      setError("Choisissez le bien mis en avant par cette annonce.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    // L'image est facultative : à défaut, la carte reprend la photo du bien.
    const finalImage = imageUrls[0] || imageAltUrl.trim() || null;

    const data: AnnonceFormData = {
      id: promo?.id,
      title: title.trim(),
      description: description.trim() || null,
      sous_titre: subtitle.trim() || null,
      type_annonce_id: typeId ? parseInt(typeId, 10) : null,
      bien_id: bienId,
      image: finalImage,
      cta_label: ctaLabel.trim() || null,
      // Laissé vide, le lien est dérivé du bien : /properties/<bien_id>.
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
            Les annonces apparaîtront sur la page /annonces et sur la home si vous cochez l&apos;option.
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
          <Section
            title="Le bien mis en avant"
            subtitle="L'annonce pointe vers ce bien. Son prix, ses pièces et sa localisation sont lus dessus : inutile de les ressaisir."
          >
            <Field label="Rechercher un bien">
              <Input
                value={bienQuery}
                onChange={(e) => setBienQuery(e.target.value)}
                placeholder="Nom du bien ou commune…"
              />
            </Field>

            <Field label="Bien" required>
              <select
                value={bienId}
                onChange={(e) => setBienId(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">— Choisir un bien —</option>
                {biensFiltres.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name ?? "Sans nom"}
                    {b.ville_commune ? ` · ${b.ville_commune}` : ""}
                    {b.is_active ? "" : " (dépublié)"}
                  </option>
                ))}
              </select>
              {biens.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Aucun bien enregistré.{" "}
                  <Link href="/admin/biens/nouveau" className="underline">
                    Créez-en un
                  </Link>{" "}
                  avant de publier une annonce.
                </p>
              )}
            </Field>

            {bienSelectionne && (
              <div className="mt-2 flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 p-3">
                {bienSelectionne.image && (
                  // Vignette de prévisualisation : l'URL du bien peut être une
                  // adresse externe saisie à la main, donc hors des domaines
                  // déclarés dans next.config.mjs — next/image échouerait.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bienSelectionne.image}
                    alt=""
                    className="h-14 w-14 rounded object-cover flex-none"
                  />
                )}
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-stone-800 truncate">
                    {bienSelectionne.name ?? "Sans nom"}
                  </p>
                  <p className="text-stone-500 text-xs">
                    {bienSelectionne.ville_commune ?? "Localisation non renseignée"}
                    {" · "}
                    {bienSelectionne.prix_month != null
                      ? `${bienSelectionne.prix_month.toLocaleString("fr-FR")} FCFA /mois`
                      : bienSelectionne.prix != null
                        ? `${bienSelectionne.prix.toLocaleString("fr-FR")} FCFA`
                        : "Prix non renseigné"}
                  </p>
                  {bienSelectionne.is_active ? (
                    <Link
                      href={`/admin/biens/${bienSelectionne.id}`}
                      className="text-xs underline text-stone-500"
                    >
                      Modifier ce bien
                    </Link>
                  ) : (
                    <p className="text-xs text-amber-700">
                      Ce bien est dépublié : l&apos;annonce ne mènera nulle part.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Section>

          <Section title="Informations de l'annonce">
            <Field label="Type d'annonce">
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">— Aucun —</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-stone-500 mt-1">
                Affiché en pastille sur la carte de l&apos;annonce.
              </p>
            </Field>

            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex : Villa Duplex avec Piscine - Riviera 4"
              />
            </Field>

            <Field label="Accroche">
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex : Dernier lot disponible"
              />
            </Field>

            <Field label="Texte de l'annonce">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Quelques lignes propres à l'annonce. Les caractéristiques du bien sont affichées automatiquement."
              />
            </Field>
          </Section>

          <Section
            title="Image"
            subtitle="Facultatif : sans visuel, la carte reprend la photo du bien. Format conseillé : 4/3 ou 16/9."
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
            subtitle="Par défaut, l'annonce renvoie vers la fiche du bien sélectionné."
          >
            <Field label="Libellé du bouton (Optionnel)">
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Découvrir l'offre"
              />
            </Field>
            <Field label="Lien personnalisé (optionnel)">
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="Laissez vide : l'annonce mène au bien choisi"
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
