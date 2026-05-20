"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader } from "../../_components/data-table";
import { ImageUploader } from "../../_components/image-uploader";
import { bulkImportAllBienImages } from "@/src/actions/bien.actions";

type Bien = {
  id: string;
  name: string;
  type: string;
  ville: string;
  prix: number;
  statut: "Disponible" | "Réservé" | "Vendu" | "Loué";
};

const MOCK_BIENS: Bien[] = [
  {
    id: "1",
    name: "Appartement Genève",
    type: "Appartement",
    ville: "Plateau",
    prix: 60000,
    statut: "Disponible",
  },
  {
    id: "2",
    name: "Villa Tripoli",
    type: "Villa",
    ville: "Cocody",
    prix: 250000,
    statut: "Réservé",
  },
  {
    id: "3",
    name: "Studio Yaya Touré",
    type: "Studio",
    ville: "Marcory",
    prix: 35000,
    statut: "Disponible",
  },
  {
    id: "4",
    name: "Duplex Riviera",
    type: "Duplex",
    ville: "Riviera",
    prix: 180000,
    statut: "Loué",
  },
  {
    id: "5",
    name: "Terrain Bingerville",
    type: "Terrain",
    ville: "Bingerville",
    prix: 95000,
    statut: "Disponible",
  },
];

export function PreviewClient() {
  const [images, setImages] = React.useState<string[]>([]);

  const columns: ColumnDef<Bien>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Nom</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-neutral-900">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "ville",
      header: "Ville",
    },
    {
      accessorKey: "prix",
      header: ({ column }) => (
        <SortableHeader column={column}>Prix</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.prix.toLocaleString("fr-FR")} FCFA
        </span>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => <StatutBadge statut={row.original.statut} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: () => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Eye className="h-3.5 w-3.5" />
            <span className="sr-only">Voir</span>
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Éditer</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Outils admin (dev)
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Outils de développement / migration. Page accessible uniquement aux
          admins via l'URL directe.
        </p>
      </div>

      {/* Bulk import des photos legacy */}
      <BulkImportSection />

      {/* DataTable */}
      <section className="space-y-3">
        <header>
          <h2 className="text-lg font-semibold">DataTable</h2>
          <p className="text-sm text-neutral-500">
            Tri sur les colonnes "Nom" et "Prix", recherche globale sur la
            colonne "Nom", pagination (5 lignes/page).
          </p>
        </header>
        <DataTable
          columns={columns}
          data={MOCK_BIENS}
          searchKey="name"
          searchPlaceholder="Rechercher un bien…"
          pageSize={5}
          emptyMessage="Aucun bien."
          emptyAction={
            <Button asChild size="sm">
              <Link href="#">Créer un bien</Link>
            </Button>
          }
        />
      </section>

      {/* ImageUploader */}
      <section className="space-y-3">
        <header>
          <h2 className="text-lg font-semibold">ImageUploader</h2>
          <p className="text-sm text-neutral-500">
            Drag-drop multi-images, preview, drag-to-reorder, marquer cover,
            supprimer. Upload réel vers Supabase Storage (chemin :{" "}
            <code>dev-preview/test</code>).
          </p>
        </header>
        <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6">
          <ImageUploader
            value={images}
            onChange={setImages}
            pathPrefix="dev-preview/test"
            maxFiles={6}
          />
          <pre className="mt-4 rounded bg-stone-50 p-3 text-xs text-neutral-600 overflow-x-auto">
{JSON.stringify(images, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}

type ImportResult = {
  id: string;
  name: string | null;
  folder: string | null;
  imported: number;
  ok: boolean;
};

function BulkImportSection() {
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState<ImportResult[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onRun() {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const r = await bulkImportAllBienImages();
      if (!r.ok) {
        setError("Échec global de l'import (non autorisé ?).");
      } else {
        setResults(r.results);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setRunning(false);
    }
  }

  const totalImported = results?.reduce((sum, r) => sum + r.imported, 0) ?? 0;

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold">
          Import en masse des photos legacy
        </h2>
        <p className="text-sm text-neutral-500">
          Parcourt chaque bien et importe ses photos depuis le folder Storage
          (<code>biens/&lt;folder&gt;/</code>) vers la table{" "}
          <code>bien_images</code>. <strong>Idempotent</strong> : un bien déjà
          importé est sauté.
        </p>
      </header>
      <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6 space-y-4">
        <Button onClick={onRun} disabled={running}>
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {running ? "Import en cours…" : "Lancer l'import"}
          </span>
        </Button>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {totalImported > 0 ? (
                <span className="text-green-700">
                  ✓ {totalImported} photo{totalImported > 1 ? "s" : ""}{" "}
                  importée{totalImported > 1 ? "s" : ""} sur {results.length}{" "}
                  bien{results.length > 1 ? "s" : ""}.
                </span>
              ) : (
                <span className="text-neutral-700">
                  Aucune nouvelle photo à importer (tous les biens sont déjà à
                  jour).
                </span>
              )}
            </div>
            <div className="rounded-md border border-stone-200 max-h-64 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Bien</th>
                    <th className="px-3 py-2 text-left">Folder</th>
                    <th className="px-3 py-2 text-right">Importées</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-t border-stone-100">
                      <td className="px-3 py-2 truncate">
                        {r.name ?? "(sans nom)"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-neutral-500">
                        {r.folder ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {r.ok ? (
                          r.imported > 0 ? (
                            <span className="font-semibold text-green-700">
                              +{r.imported}
                            </span>
                          ) : (
                            <span className="text-neutral-400">déjà OK</span>
                          )
                        ) : (
                          <span className="text-red-600">erreur</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatutBadge({ statut }: { statut: Bien["statut"] }) {
  const colors: Record<Bien["statut"], string> = {
    Disponible: "bg-green-100 text-green-700",
    Réservé: "bg-amber-100 text-amber-700",
    Vendu: "bg-neutral-200 text-neutral-700",
    Loué: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[statut]}`}
    >
      {statut}
    </span>
  );
}
