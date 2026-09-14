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
import { CommuneAdminRow } from "@/src/actions/admin/communes";
import {
  upsertQuartier,
  type QuartierRow,
} from "@/src/actions/admin/quartiers";

const BADGES = ["Premium", "Business", "Lifestyle", "Familles", "Investir", "Étudiants", "Plage", "Calme"];

export function QuartierForm({
  row,
  communes = [],
  communeParDefaut,
}: {
  row?: QuartierRow;
  communes?: CommuneAdminRow[];
  /** Pré-sélection quand on arrive depuis la fiche d'une commune. */
  communeParDefaut?: string;
}) {
  const router = useRouter();
  const isEdit = !!row;

  const [name, setName] = React.useState(row?.name ?? "");
  const preselection = !row
    ? communes.find((c) => c.id === communeParDefaut)
    : undefined;
  const [commune, setCommune] = React.useState(
    row?.commune ?? preselection?.nom ?? "",
  );
  const [communeId, setCommuneId] = React.useState(
    row?.commune_id ?? preselection?.id ?? "",
  );
  const [badge, setBadge] = React.useState(row?.badge ?? "");
  const [tagline, setTagline] = React.useState(row?.tagline ?? "");
  const [description, setDescription] = React.useState(row?.description ?? "");
  const [searchQuery, setSearchQuery] = React.useState(row?.search_query ?? "");
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);
  const [isFeatured, setIsFeatured] = React.useState(row?.is_featured ?? false);

  const [imageUrls, setImageUrls] = React.useState<string[]>(
    row?.image && row.image.startsWith("/images/") ? [] : row?.image ? [row.image] : [],
  );
  const [imageAlt, setImageAlt] = React.useState(
    row?.image && row.image.startsWith("/images/") ? row.image : "",
  );

  // Quartiers créés avant la table `communes` : on retrouve la commune par
  // correspondance de nom. C'est une valeur dérivée, pas un effet de bord —
  // la calculer pendant le rendu évite un second rendu au chargement.
  const communeIdEffectif =
    communeId ||
    (commune
      ? (communes.find(
          (c) => c.nom.trim().toLowerCase() === commune.trim().toLowerCase(),
        )?.id ?? "")
      : "");

  // Choisir une commune synchronise aussi le libellé texte `commune`,
  // utilisé par la recherche publique.
  function handleCommuneChange(id: string) {
    setCommuneId(id);
    const c = communes.find((x) => x.id === id);
    if (c) setCommune(c.nom);
  }

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Identifiant de brouillon figé au premier rendu : le calculer dans un
  // useMemo appelait une fonction impure, et un re-rendu pouvait déplacer
  // le dossier de destination des images en cours d'envoi.
  const [brouillonId] = React.useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10),
  );
  const pathPrefix = row?.id ? `quartiers/${row.id}` : `quartiers/draft-${brouillonId}`;

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

    const result = await upsertQuartier({
      id: row?.id,
      name,
      commune,
      commune_id: communeIdEffectif || null,
      badge: badge || null,
      tagline: tagline || null,
      description: description || null,
      image: finalImage,
      search_query: searchQuery || null,
      is_active: isActive,
      is_featured: isFeatured,
      ordre: row?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/quartiers?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/quartiers"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux quartiers
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {isEdit ? "Enregistrer" : "Créer le quartier"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? `${row?.name} · ${row?.commune}` : "Nouveau quartier"}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Identité</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom du quartier" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Cocody"
                  required
                />
              </Field>
              <Field label="Commune" required>
                {communes.length > 0 ? (
                  <>
                    <select
                      value={communeIdEffectif}
                      onChange={(e) => handleCommuneChange(e.target.value)}
                      required
                      className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="" disabled>
                        Choisir une commune…
                      </option>
                      {communes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                          {c.is_active ? "" : " (inactive)"}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Gérées dans{" "}
                      <Link href="/admin/communes" className="underline">
                        Communes
                      </Link>
                      .
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      placeholder="Ex : Abidjan"
                      required
                    />
                    <p className="mt-1 text-[11px] text-amber-600">
                      Aucune commune enregistrée :{" "}
                      <Link href="/admin/communes/nouveau" className="underline">
                        créez-en une
                      </Link>{" "}
                      pour rattacher proprement ce quartier.
                    </p>
                  </>
                )}
              </Field>
            </div>

            <Field label="Badge (catégorie courte)">
              <div className="flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(badge === b ? "" : b)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                      badge === b
                        ? "border-primary bg-primary text-white"
                        : "border-stone-300 text-neutral-700 hover:border-primary/40"
                    }`}
                  >
                    {b}
                  </button>
                ))}
                <Input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Autre..."
                  className="w-32 text-xs"
                />
              </div>
            </Field>

            <Field label="Tagline (phrase courte)">
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex : Le prestige résidentiel"
              />
            </Field>

            <Field label="Description longue">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le quartier : ambiance, public, points forts..."
                rows={4}
              />
            </Field>

            <Field label="Mot-clé recherche (optionnel)">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Si vide, utilise le nom du quartier"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Utilisé pour préfilter /properties?q=... au clic sur la card.
                Permet par exemple de chercher « Riviera » sur un quartier nommé
                « Riviera Bonoumin ».
              </p>
            </Field>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Image</h2>
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
                placeholder="Ex : /images/biens/bien6.jpg"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
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
                  Quartier actif
                </span>
                <span className="block text-xs text-neutral-500">
                  Visible dans le dropdown Localisation et la section quartiers.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  Mis en avant sur la home
                </span>
                <span className="block text-xs text-neutral-500">
                  Affiché en grande card dans la section « Nos quartiers » de la home.
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
