
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [slug, setSlug] = useState(item?.slug || "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  useEffect(() => {
    if (autoSlug) setSlug(slugify(nom));
  }, [nom, autoSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const data: CommuneFormData = { id: item?.id, nom, slug, is_active: isActive, ordre: item?.ordre };
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
          <Input value={slug} onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }} required placeholder="ex: cocody" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-primary" />
          <span className="text-sm font-medium">Commune active</span>
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
