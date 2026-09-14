
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  // Champs de présentation : ils alimentent la section « Communes phares »
  // de l'accueil et le visuel du méga-menu.
  const [badge, setBadge] = useState(item?.badge || "");
  const [tagline, setTagline] = useState(item?.tagline || "");
  const [description, setDescription] = useState(item?.description || "");
  const [searchQuery, setSearchQuery] = useState(item?.search_query || "");
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);
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
      ordre: item?.ordre,
      badge: badge.trim() || null,
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      search_query: searchQuery.trim() || null,
      image: imageUrls[0] || imageAltUrl.trim() || null,
      is_featured: isFeatured,
    };
    const result = await upsertCommuneAndRedirect(data);
    if (!result.ok) { setError(result.error); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl pt-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0"><Link href="/admin/communes"><ArrowLeft className="h-4 w-4" /></Link></Button>
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
        </div>

        <div className="space-y-1.5">
          <Label>Badge</Label>
          <Input
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Ex : Très demandé"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Quelques lignes sur la commune."
          />
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

        <div className="space-y-1.5">
          <Label>Terme de recherche</Label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Laissez vide pour utiliser le nom de la commune"
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
            {/* Le libellé promettait un « ordre défini sur la liste » : aucun
                écran n'expose `communes.ordre`, qui est attribué à la création
                (max + 1) et jamais modifiable. On ne promet donc que ce que
                l'admin contrôle réellement — la case elle-même. */}
            <span className="block text-xs text-neutral-500">
              La section « Communes phares » de l&apos;accueil montre les trois
              premières communes cochées.
            </span>
          </span>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" asChild><Link href="/admin/communes">Annuler</Link></Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
