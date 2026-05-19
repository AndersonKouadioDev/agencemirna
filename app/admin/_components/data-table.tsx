"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * <DataTable> — composant réutilisable pour toutes les tables admin.
 *
 * Built on TanStack Table v8 : tri, filtre/recherche, pagination.
 * Style cohérent avec le reste de l'admin (stone/primary).
 *
 * Pattern d'usage (côté CRUD) :
 *
 * ```tsx
 * const columns: ColumnDef<Bien>[] = [
 *   { accessorKey: "name", header: ({ column }) => <SortableHeader column={column}>Nom</SortableHeader> },
 *   { accessorKey: "prix", header: "Prix", cell: ({ row }) => <span>{formatPrice(row.original.prix)}</span> },
 *   {
 *     id: "actions",
 *     cell: ({ row }) => (
 *       <div className="flex justify-end gap-1">
 *         <Button asChild size="sm" variant="ghost"><Link href={`/admin/biens/${row.original.id}`}>Éditer</Link></Button>
 *       </div>
 *     ),
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={biens}
 *   searchKey="name"
 *   searchPlaceholder="Rechercher un bien…"
 *   emptyMessage="Aucun bien pour l'instant."
 *   emptyAction={<Button asChild><Link href="/admin/biens/nouveau">Créer le premier bien</Link></Button>}
 * />
 * ```
 */
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Si présent : barre de recherche au-dessus de la table. Filtre la colonne portant ce key. */
  searchKey?: string;
  searchPlaceholder?: string;
  /** Nombre de lignes par page. Défaut : 10. */
  pageSize?: number;
  /** Message affiché quand data est vide. */
  emptyMessage?: string;
  /** Bouton ou élément CTA dans l'empty state. */
  emptyAction?: React.ReactNode;
  /** Classe additionnelle sur le wrapper. */
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Rechercher…",
  pageSize = 10,
  emptyMessage = "Aucun résultat.",
  emptyAction,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: searchKey
      ? (row, _columnId, filterValue) => {
          const value = row.getValue(searchKey);
          if (value == null) return false;
          return String(value)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  const hasResults = table.getRowModel().rows.length > 0;
  const hasFilter = globalFilter.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Barre de recherche */}
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 bg-white border-stone-200"
          />
        </div>
      )}

      {/* Tableau */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent bg-stone-50/60"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {hasResults ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                      <Inbox className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="text-sm text-neutral-500">
                      {hasFilter ? (
                        <>
                          Aucun résultat pour{" "}
                          <span className="font-medium text-neutral-700">
                            "{globalFilter}"
                          </span>
                        </>
                      ) : (
                        emptyMessage
                      )}
                    </div>
                    {!hasFilter && emptyAction}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {hasResults && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            Page{" "}
            <span className="font-medium text-neutral-900">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-neutral-900">
              {table.getPageCount()}
            </span>{" "}
            <span className="text-neutral-400">
              · {table.getFilteredRowModel().rows.length} entrée
              {table.getFilteredRowModel().rows.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-stone-200 hover:bg-stone-100"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Précédent</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-stone-200 hover:bg-stone-100"
            >
              <span className="sr-only sm:not-sr-only sm:mr-1">Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Bouton de tri à utiliser dans `header` d'une ColumnDef pour rendre
 * l'en-tête cliquable.
 *
 * Usage :
 * ```tsx
 * { accessorKey: "name", header: ({ column }) => <SortableHeader column={column}>Nom</SortableHeader> }
 * ```
 */
export function SortableHeader<TData, TValue>({
  column,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="inline-flex items-center gap-1.5 -mx-2 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 hover:bg-stone-100 transition-colors"
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
}
