"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  ExternalLink,
  ImageOff,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  SortableHeader,
} from "../../_components/data-table";
import type { BienAdminRow } from "@/src/actions/admin/biens";
import { deleteBien } from "@/src/actions/admin/biens";

export function BiensTable({ biens }: { biens: BienAdminRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<BienAdminRow | null>(
    null,
  );

  async function onDelete(id: string) {
    setDeletingId(id);
    const result = await deleteBien(id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (result.ok) {
      router.refresh();
    } else {
      alert("Erreur : " + result.error);
    }
  }

  const columns: ColumnDef<BienAdminRow>[] = React.useMemo(
    () => [
      {
        id: "cover",
        header: () => <span className="sr-only">Photo</span>,
        cell: ({ row }) => <CoverCell bien={row.original} />,
        size: 80,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column}>Bien</SortableHeader>
        ),
        cell: ({ row }) => <NameCell bien={row.original} />,
      },
      {
        id: "type",
        header: "Type & service",
        cell: ({ row }) => <TypeServiceCell bien={row.original} />,
      },
      {
        accessorKey: "prix",
        header: ({ column }) => (
          <SortableHeader column={column}>Prix</SortableHeader>
        ),
        cell: ({ row }) => <PrixCell bien={row.original} />,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <ActionsCell
            bien={row.original}
            onDelete={() => setConfirmDelete(row.original)}
            isDeleting={deletingId === row.original.id}
          />
        ),
      },
    ],
    [deletingId],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={biens}
        searchKey="name"
        searchPlaceholder="Rechercher un bien par nom…"
        pageSize={15}
        emptyMessage="Aucun bien pour l'instant."
        emptyAction={
          <Button asChild size="sm">
            <Link href="/admin/biens/nouveau">Créer le premier bien</Link>
          </Button>
        }
      />

      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <DeleteConfirmModal
          bien={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => onDelete(confirmDelete.id)}
          isDeleting={deletingId === confirmDelete.id}
        />
      )}
    </>
  );
}

// ---------- Cells ----------

function CoverCell({ bien }: { bien: BienAdminRow }) {
  const url = bien.cover_url;
  if (!url) {
    return (
      <div className="flex h-14 w-20 items-center justify-center rounded-md bg-stone-100 text-neutral-400">
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="relative h-14 w-20 overflow-hidden rounded-md bg-stone-100">
      <Image
        src={url}
        alt={bien.name ?? ""}
        fill
        sizes="80px"
        className="object-cover"
      />
      {bien.images_count != null && bien.images_count > 1 && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[10px] font-medium text-white">
          +{bien.images_count - 1}
        </span>
      )}
    </div>
  );
}

function NameCell({ bien }: { bien: BienAdminRow }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/admin/biens/${bien.id}`}
        className="font-medium text-neutral-900 hover:text-primary truncate block"
      >
        {bien.name ?? "(sans nom)"}
      </Link>
      <div className="text-xs text-neutral-500 truncate">
        {[bien.ville_commune, bien.pays].filter(Boolean).join(" · ")}
      </div>
    </div>
  );
}

function TypeServiceCell({ bien }: { bien: BienAdminRow }) {
  const type = bien.types_bien?.name;
  const service = bien.services_bien?.name;
  const cat = bien.categories_bien?.name;
  return (
    <div className="flex flex-wrap gap-1">
      {type && (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {type}
        </span>
      )}
      {service && (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {service}
        </span>
      )}
      {cat && (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {cat}
        </span>
      )}
      {!type && !service && !cat && (
        <span className="text-xs text-neutral-400">—</span>
      )}
    </div>
  );
}

function PrixCell({ bien }: { bien: BienAdminRow }) {
  if (bien.prix == null) {
    return <span className="text-xs text-neutral-400">—</span>;
  }
  return (
    <div className="tabular-nums">
      <div className="font-medium text-neutral-900">
        {bien.prix.toLocaleString("fr-FR")} FCFA
      </div>
      {bien.prix_month != null && bien.prix_month !== bien.prix && (
        <div className="text-xs text-neutral-500">
          /mois : {bien.prix_month.toLocaleString("fr-FR")}
        </div>
      )}
    </div>
  );
}

function ActionsCell({
  bien,
  onDelete,
  isDeleting,
}: {
  bien: BienAdminRow;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-stone-100"
            disabled={isDeleting}
            aria-label="Actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/biens/${bien.id}`}>
              <Pencil className="h-4 w-4" />
              Éditer
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/properties/${bien.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Voir sur le site
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---------- Modal de confirmation ----------

function DeleteConfirmModal({
  bien,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  bien: BienAdminRow;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">Supprimer ce bien ?</h2>
        <p className="text-sm text-neutral-600 mb-6">
          <span className="font-medium text-neutral-900">{bien.name}</span>
          {" "}sera définitivement supprimé, ainsi que toutes ses photos.
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="hover:bg-stone-100 border-stone-200"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Suppression…" : "Supprimer définitivement"}
          </Button>
        </div>
      </div>
    </div>
  );
}
