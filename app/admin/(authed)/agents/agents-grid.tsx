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
  GripVertical,
  Mail,
  Phone,
  Pencil,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteAgent,
  reorderAgents,
  toggleAgentActive,
  type AgentAdminRow,
} from "@/src/actions/admin/agents";

export function AgentsGrid({ agents }: { agents: AgentAdminRow[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(agents);
  const [confirmDelete, setConfirmDelete] =
    React.useState<AgentAdminRow | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(agents);
  }, [agents]);

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
    const result = await reorderAgents(next.map((a) => a.id));
    if (!result.ok) {
      setItems(items);
      alert("Erreur : " + result.error);
    } else {
      router.refresh();
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: isActive } : a)),
    );
    const result = await toggleAgentActive(id, isActive);
    if (!result.ok) {
      setItems(agents);
      alert("Erreur : " + result.error);
    } else {
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteAgent(id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (result.ok) {
      router.refresh();
    } else {
      alert("Erreur : " + result.error);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-12 text-center">
        <Users className="h-8 w-8 mx-auto text-neutral-400 mb-3" />
        <p className="text-sm text-neutral-600 mb-4">
          Aucun agent pour l'instant.
        </p>
        <Button asChild size="sm">
          <Link href="/admin/agents/nouveau">Ajouter le premier agent</Link>
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
          items={items.map((a) => a.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggle={(active) => handleToggle(agent.id, active)}
                onDelete={() => setConfirmDelete(agent)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {confirmDelete && (
        <DeleteConfirm
          agent={confirmDelete}
          isDeleting={deletingId === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}
    </>
  );
}

// ============================================================================

function AgentCard({
  agent,
  onToggle,
  onDelete,
}: {
  agent: AgentAdminRow;
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
  } = useSortable({ id: agent.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-white overflow-hidden",
        isDragging ? "border-primary shadow-lg" : "border-stone-200",
        !agent.is_active && "opacity-70",
      )}
    >
      {/* Drag handle (top right, hover only) */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm"
        aria-label="Réorganiser"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Photo + identité */}
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0">
          {agent.photo ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-stone-100">
              <Image
                src={agent.photo}
                alt={agent.full_name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={cn(
                "font-semibold truncate",
                agent.is_active ? "text-neutral-900" : "text-neutral-500",
              )}
            >
              {agent.full_name}
            </h3>
            {!agent.is_active && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                Désactivé
              </span>
            )}
          </div>
          {agent.role && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              {agent.role}
            </p>
          )}
          {agent.specialites.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.specialites.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  {s}
                </span>
              ))}
              {agent.specialites.length > 3 && (
                <span className="text-[10px] text-neutral-500">
                  +{agent.specialites.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 pb-3 space-y-1 text-xs text-neutral-600">
        {agent.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
            <span className="truncate">{agent.email}</span>
          </div>
        )}
        {agent.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
            <span className="truncate">{agent.phone}</span>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-stone-100 px-3 py-2 flex items-center justify-between">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={agent.is_active}
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
            <Link href={`/admin/agents/${agent.id}`}>
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
  agent,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  agent: AgentAdminRow;
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
        <h2 className="text-lg font-semibold mb-2">Supprimer cet agent ?</h2>
        <p className="text-sm text-neutral-600 mb-6">
          <span className="font-medium text-neutral-900">
            {agent.full_name}
          </span>{" "}
          sera définitivement supprimé. Cette action est irréversible.
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
