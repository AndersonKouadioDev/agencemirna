
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import { CommuneFormData, CommuneAdminRow, upsertCommuneAndRedirect } from "@/src/actions/admin/communes";

function slugify(text: string) {
  // NB : l'ancienne classe [^w\-] signifiait « tout sauf la lettre w »,
  // ce qui vidait le slug de toutes les communes (« Cocody » -> "").
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents (Attécoubé -> Attecoube)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CommuneForm({ item }: { item?: CommuneAdminRow }) {
  const isEdit = !!item;
  const [nom, setNom] = useState(item?.nom || "");
  const [slugSaisi, setSlugSaisi] = useState(item?.slug || "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  // Seuls les champs de présentation réellement rendus sur la vitrine sont
  // saisissables : la carte « Communes phares » n'affiche que le nom,
  // l'accroche et l'image. Badge, description et terme de recherche ont été
  // retirés — aucune page ne les lisait, et le placeholder du terme de
  // recherche promettait un repli qui n'existait pas.
  const [tagline, setTagline] = useState(item?.tagline || "");
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);
  const [ordre, setOrdre] = useState<number | null>(item?.ordre ?? null);
  const [imageUrls, setImageUrls] = useState<string[]>(
    item?.image ? [item.image] : [],
  );
  const [imageAltUrl, setImageAltUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  // Tant que l'admin n'a pas édité le slug, c'est une valeur DÉRIVÉE du nom :
  // la calculer pendant le rendu évite l'aller-retour d'un useEffect, qui
  // affichait brièvement l'ancien slug après chaque frappe.
  const slug = autoSlug ? slugify(nom) : slugSaisi;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const data: CommuneFormData = {
      id: item?.id,
      nom,
      slug,
      is_active: isActive,
      ordre: ordre ?? undefined,
      tagline: tagline.trim() || null,
      image: imageUrls[0] || imageAltUrl.trim() || null,
      is_featured: isFeatured,
    };
    const result = await upsertCommuneAndRedirect(data);
    if (!result.ok) { setError(result.error); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl pt-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0"><Link href="/admin/geographie"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <MapPin className="h-5 w-5 text-neutral-400" />
          {isEdit ? "Modifier la commune" : "Nouvelle commune"}
        </h1>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-6">{error}</div>}
      <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
        <div className="space-y-1.5">
          <Label>Nom de la commune <span className="text-red-500">*</span></Label>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Ex: Cocody" />
        </div>
        <div className="space-y-1.5">
          <Label>Slug (URL) <span className="text-red-500">*</span></Label>
          <Input value={slug} onChange={(e) => { setSlugSaisi(e.target.value); setAutoSlug(false); }} required placeholder="ex: cocody" />
        </div>
        <div className="space-y-1.5">
          <Label>Ordre d&apos;affichage</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={ordre ?? ""}
            onChange={(e) =>
              setOrdre(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="auto"
          />
          <p className="text-xs text-neutral-500">
            Du plus petit au plus grand. Décide de l&apos;ordre des communes
            dans le menu, le pied de page et la section « Communes phares »,
            qui n&apos;en montre que les trois premières. Laissez vide à la
            création pour placer la commune en fin de liste.
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-primary" />
          <span className="text-sm font-medium">Commune active</span>
        </label>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4 mt-6">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Présentation</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Utilisée par la section « Communes phares » de l&apos;accueil et par
            le menu du site.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Accroche</Label>
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ex : Le prestige résidentiel"
          />
          <p className="text-xs text-neutral-500">
            Affichée sous le nom sur la carte de l&apos;accueil.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Image</Label>
          <ImageUploader
            value={imageUrls}
            onChange={setImageUrls}
            pathPrefix={`communes/${item?.id ?? "nouveau"}`}
            maxFiles={1}
          />
          <Input
            value={imageAltUrl}
            onChange={(e) => setImageAltUrl(e.target.value)}
            placeholder="Ou une URL d'image existante"
            className="text-sm mt-2"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary"
          />
          <span className="text-sm">
            <span className="font-medium">Afficher sur l&apos;accueil</span>
            <span className="block text-xs text-neutral-500">
              La section « Communes phares » de l&apos;accueil montre les trois
              premières communes cochées, dans l&apos;ordre d&apos;affichage
              ci-dessus.
            </span>
          </span>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" asChild><Link href="/admin/geographie">Annuler</Link></Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
