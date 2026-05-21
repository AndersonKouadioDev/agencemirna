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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  reorderServices,
  toggleServiceActive,
  type ServiceAdminRow,
} from "@/src/actions/admin/services";

/**
 * Liste éditable des 6 services :
 * - Cards verticales drag-to-reorder (dnd-kit)
 * - Toggle active/inactive inline
 * - Lien "Éditer" → /admin/services/[id]
 */
export function ServicesList({
  services,
}: {
  services: ServiceAdminRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(services);

  // Sync si la prop change (après revalidate)
  React.useEffect(() => {
    setItems(services);
  }, [services]);

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
    setItems(next); // optimistic
    const result = await reorderServices(next.map((s) => s.id));
    if (!result.ok) {
      setItems(items); // rollback
      alert("Erreur : " + result.error);
    } else {
      router.refresh();
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    // optimistic
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)),
    );
    const result = await toggleServiceActive(id, isActive);
    if (!result.ok) {
      setItems(services); // rollback
      alert("Erreur : " + result.error);
    } else {
      router.refresh();
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-12 text-center">
        <Sparkles className="h-8 w-8 mx-auto text-neutral-400 mb-3" />
        <p className="text-sm text-neutral-600">
          Aucun service trouvé. Vérifie la migration 0004 (seed).
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-3">
          {items.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onToggle={(active) => handleToggle(service.id, active)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

// ============================================================================

function ServiceRow({
  service,
  onToggle,
}: {
  service: ServiceAdminRow;
  onToggle: (isActive: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-white overflow-hidden",
        isDragging ? "border-primary shadow-lg" : "border-stone-200",
        !service.is_active && "opacity-60",
      )}
    >
      <div className="flex items-stretch">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex items-center justify-center px-3 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 hover:bg-stone-50 border-r border-stone-200"
          aria-label="Réorganiser"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Image / Icon preview */}
        <div className="shrink-0 flex items-center px-3">
          {service.image ? (
            <div className="relative h-14 w-20 overflow-hidden rounded-md bg-stone-100">
              <Image
                src={service.image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-20 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
              {service.icon ?? ":"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-3 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "font-medium truncate",
                service.is_active
                  ? "text-neutral-900"
                  : "text-neutral-500",
              )}
            >
              {service.name}
            </h3>
            {!service.is_active && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 shrink-0">
                Désactivé
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 line-clamp-2">
            {service.short_description ?? ":"}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-neutral-400">
            <span className="font-mono">/{service.slug}</span>
            {service.highlights.length > 0 && (
              <span>
                {service.highlights.length} point
                {service.highlights.length > 1 ? "s" : ""} clé
                {service.highlights.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-1 pr-2">
          {/* Toggle switch */}
          <label className="inline-flex items-center cursor-pointer px-2">
            <input
              type="checkbox"
              checked={service.is_active}
              onChange={(e) => onToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-stone-200 peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
          </label>

          {/* Voir public (si actif) */}
          {service.is_active && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-stone-100"
              title="Voir sur le site"
            >
              <Link
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="sr-only">Voir sur le site</span>
              </Link>
            </Button>
          )}

          {/* Éditer */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-stone-100"
            title="Éditer"
          >
            <Link href={`/admin/services/${service.id}`}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Éditer</span>
            </Link>
          </Button>
        </div>
      </div>
    </li>
  );
}
