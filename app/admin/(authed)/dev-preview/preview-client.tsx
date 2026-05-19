"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader } from "../../_components/data-table";
import { ImageUploader } from "../../_components/image-uploader";

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
          Aperçu des composants admin
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Page de QA visuelle des composants <code>DataTable</code> et{" "}
          <code>ImageUploader</code>. Données mockées. À supprimer une fois les
          CRUD réels en place.
        </p>
      </div>

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
