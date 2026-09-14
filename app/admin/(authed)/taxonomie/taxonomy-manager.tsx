"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Check, X, Pencil, Trash2, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import {
  upsertTaxonomyEntry,
  deleteTaxonomyEntry,
  type TaxonomyRow,
  type TaxonomyTable,
} from "@/src/actions/admin/taxonomy";

type Brouillon = {
  id?: number;
  name: string;
  image: string | null;
  ordre: number | null;
};

const VIDE: Brouillon = { name: "", image: null, ordre: null };

export function TaxonomyManager({
  table,
  title,
  description,
  items,
}: {
  table: TaxonomyTable;
  title: string;
  description: string;
  items: TaxonomyRow[];
}) {
  const router = useRouter();
  const [brouillon, setBrouillon] = React.useState<Brouillon | null>(null);
  const [busy, setBusy] = React.useState<number | "nouveau" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const enEdition = brouillon !== null;

  function ouvrirCreation() {
    setError(null);
    setBrouillon({ ...VIDE });
  }

  function ouvrirEdition(row: TaxonomyRow) {
    setError(null);
    setBrouillon({
      id: row.id,
      name: row.name,
      image: row.image,
      ordre: row.ordre,
    });
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!brouillon) return;
    setError(null);
    setBusy(brouillon.id ?? "nouveau");

    const res = await upsertTaxonomyEntry(table, {
      id: brouillon.id,
      name: brouillon.name,
      image: brouillon.image,
      ordre: brouillon.ordre,
    });

    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setBrouillon(null);
    router.refresh();
  }

  async function supprimer(row: TaxonomyRow) {
    if (
      !confirm(
        `Supprimer « ${row.name} » ? Les biens qui l'utilisent empêcheront la suppression.`,
      )
    )
      return;
    setError(null);
    setBusy(row.id);
    const res = await deleteTaxonomyEntry(table, row.id);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
        {!enEdition && (
          <Button type="button" variant="outline" onClick={ouvrirCreation}>
            <Plus className="h-4 w-4 mr-1.5" />
            Ajouter
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {enEdition && brouillon && (
        <form
          onSubmit={enregistrer}
          className="rounded-md border border-stone-200 bg-stone-50/60 p-4 mb-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
            <div className="space-y-1.5">
              <Label>
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                value={brouillon.name}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, name: e.target.value })
                }
                required
                autoFocus
                placeholder="Ex : Villa"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ordre</Label>
              <Input
                type="number"
                value={brouillon.ordre ?? ""}
                onChange={(e) =>
                  setBrouillon({
                    ...brouillon,
                    ordre: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="auto"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Image</Label>
            <ImageUploader
              value={brouillon.image ? [brouillon.image] : []}
              onChange={(urls) =>
                setBrouillon({ ...brouillon, image: urls[0] ?? null })
              }
              pathPrefix={`taxonomie/${table}`}
              maxFiles={1}
            />
            <Input
              value={brouillon.image ?? ""}
              onChange={(e) =>
                setBrouillon({ ...brouillon, image: e.target.value || null })
              }
              placeholder="Ou une URL d'image existante"
              className="text-sm"
            />
            <p className="text-xs text-neutral-500">
              Affichée dans le menu du site au survol de cette entrée.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setBrouillon(null)}
            >
              <X className="h-4 w-4 mr-1.5" />
              Annuler
            </Button>
            <Button type="submit" disabled={busy !== null}>
              {busy !== null ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Check className="h-4 w-4 mr-1.5" />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune entrée pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {items.map((row) => (
            <li key={row.id} className="flex items-center gap-3 py-2.5">
              <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-stone-100">
                {row.image ? (
                  <Image
                    src={row.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-stone-300">
                    <ImageOff className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {row.name}
                </p>
                {!row.image && (
                  <p className="text-xs text-amber-700">
                    Sans image : repli générique dans le menu.
                  </p>
                )}
              </div>

              <span className="text-xs font-mono text-neutral-400 shrink-0">
                {row.ordre}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => ouvrirEdition(row)}
                  aria-label={`Modifier ${row.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => supprimer(row)}
                  disabled={busy === row.id}
                  aria-label={`Supprimer ${row.name}`}
                >
                  {busy === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
