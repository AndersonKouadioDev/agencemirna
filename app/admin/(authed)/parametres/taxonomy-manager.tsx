"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addTaxonomyEntry,
  renameTaxonomyEntry,
  deleteTaxonomyEntry,
  type TaxonomyRow,
  type TaxonomyTable,
} from "@/src/actions/admin/taxonomy";

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
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [busy, setBusy] = React.useState<number | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) return;
    setAdding(true);
    const res = await addTaxonomyEntry(table, newName);
    setAdding(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNewName("");
    router.refresh();
  }

  async function onRename(id: number) {
    setError(null);
    if (!editName.trim()) return;
    setBusy(id);
    const res = await renameTaxonomyEntry(table, id, editName);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEditingId(null);
    setEditName("");
    router.refresh();
  }

  async function onDelete(id: number, name: string) {
    setError(null);
    if (!confirm(`Supprimer "${name}" ?\n\nSi des biens utilisent cette valeur, la suppression sera bloquée par la base de données.`)) return;
    setBusy(id);
    const res = await deleteTaxonomyEntry(table, id);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <header className="mb-4">
        <h2 className="font-semibold text-secondary">{title}</h2>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </header>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={onAdd} className="flex gap-2 mb-4">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ajouter une valeur..."
          className="text-sm"
        />
        <Button
          type="submit"
          disabled={adding || !newName.trim()}
          className="shrink-0"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>

      <ul className="divide-y divide-stone-100">
        {items.length === 0 && (
          <li className="py-6 text-center text-sm text-neutral-500">
            Aucune valeur. Ajoutez-en une ci-dessus.
          </li>
        )}
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-2 py-2 group"
          >
            {editingId === it.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRename(it.id);
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditName("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRename(it.id)}
                  disabled={busy === it.id}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  aria-label="Valider"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditName("");
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50"
                  aria-label="Annuler"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-neutral-800 truncate">
                  {it.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(it.id);
                    setEditName(it.name);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 hover:bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Renommer"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(it.id, it.name)}
                  disabled={busy === it.id}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
