"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  GripVertical,
  Home,
  Megaphone,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deletePromotion,
  reorderPromotions,
  togglePromotionActive,
  type PromotionAdminRow,
} from "@/src/actions/admin/promotions";

export function PromotionsGrid({
  promotions,
}: {
  promotions: PromotionAdminRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(promotions);
  const [confirmDelete, setConfirmDelete] =
    React.useState<PromotionAdminRow | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => setItems(promotions), [promotions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    const result = await reorderPromotions(next.map((p) => p.id));
    if (!result.ok) {
      setItems(items);
      alert("Erreur : " + result.error);
    } else {
      router.refresh();
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)),
    );
    const result = await togglePromotionActive(id, isActive);
    if (!result.ok) {
      setItems(promotions);
      alert("Erreur : " + result.error);
    } else {
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deletePromotion(id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (result.ok) router.refresh();
    else alert("Erreur : " + result.error);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-12 text-center">
        <Megaphone className="h-8 w-8 mx-auto text-neutral-400 mb-3" />
        <p className="text-sm text-neutral-600 mb-4">
          Aucune promotion pour l'instant. Crée ta première créa pour
          l'afficher sur le site.
        </p>
        <Button asChild size="sm">
          <Link href="/admin/promotions/nouveau">Créer la première</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                onToggle={(active) => handleToggle(promo.id, active)}
                onDelete={() => setConfirmDelete(promo)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {confirmDelete && (
        <DeleteConfirm
          promo={confirmDelete}
          isDeleting={deletingId === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}
    </>
  );
}

// ============================================================================

function PromotionCard({
  promo,
  onToggle,
  onDelete,
}: {
  promo: PromotionAdminRow;
  onToggle: (isActive: boolean) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: promo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const now = new Date();
  const isExpired = promo.ends_at && new Date(promo.ends_at) < now;
  const isScheduled = promo.starts_at && new Date(promo.starts_at) > now;
  const isLive = promo.is_active && !isExpired && !isScheduled;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-white overflow-hidden",
        isDragging ? "border-primary shadow-lg" : "border-stone-200",
        !promo.is_active && "opacity-70",
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm"
        aria-label="Réorganiser"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Image */}
      <div className="relative aspect-[16/9] bg-stone-100">
        <Image
          src={promo.image}
          alt={promo.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {promo.show_on_home && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              <Home className="h-2.5 w-2.5" />
              Home
            </span>
          )}
          {isLive && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-700">
              En ligne
            </span>
          )}
          {isExpired && (
            <span className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
              Expirée
            </span>
          )}
          {isScheduled && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Programmée
            </span>
          )}
          {!promo.is_active && (
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
              Désactivée
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={cn(
            "font-semibold truncate",
            promo.is_active ? "text-neutral-900" : "text-neutral-500",
          )}
        >
          {promo.title}
        </h3>
        {promo.description && (
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
            {promo.description}
          </p>
        )}
        {(promo.starts_at || promo.ends_at) && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {formatDateRange(promo.starts_at, promo.ends_at)}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-100 px-3 py-2 flex items-center justify-between">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={promo.is_active}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-8 h-4.5 bg-stone-200 peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-transform peer-checked:after:translate-x-3.5" />
        </label>
        <div className="flex gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-stone-100"
            title="Éditer"
          >
            <Link href={`/admin/promotions/${promo.id}`}>
              <Pencil className="h-3 w-3" />
              <span className="sr-only">Éditer</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
            onClick={onDelete}
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================

function DeleteConfirm({
  promo,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  promo: PromotionAdminRow;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
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
        <h2 className="text-lg font-semibold mb-2">
          Supprimer cette promotion ?
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          <span className="font-medium text-neutral-900">{promo.title}</span>{" "}
          sera définitivement supprimée du site.
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

// ---------- Helpers ----------

function formatDateRange(starts: string | null, ends: string | null): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (starts && ends) return `${fmt(starts)} → ${fmt(ends)}`;
  if (starts) return `À partir du ${fmt(starts)}`;
  if (ends) return `Jusqu'au ${fmt(ends)}`;
  return "";
}
