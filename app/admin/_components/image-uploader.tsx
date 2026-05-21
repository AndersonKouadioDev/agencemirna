"use client";

import * as React from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
  Star,
  StarOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAdminImage } from "@/src/actions/admin/upload";

/**
 * <ImageUploader> : composant controlled multi-images.
 *
 * - Drag & drop OU clic pour upload
 * - Preview grid des images existantes
 * - Drag-to-reorder via dnd-kit
 * - Marquer une image comme "cover" (la première par défaut)
 * - Supprimer une image
 *
 * Pattern d'usage (contrôlé) :
 * ```tsx
 * const [images, setImages] = useState<string[]>(bien.images ?? []);
 *
 * <ImageUploader
 *   value={images}
 *   onChange={setImages}
 *   pathPrefix={`biens/${bien.id}`}
 *   maxFiles={20}
 * />
 * ```
 */
export interface ImageUploaderProps {
  /** URLs des images actuelles (ordonnées). La 1ère est la cover. */
  value: string[];
  onChange: (urls: string[]) => void;
  /** Préfixe de chemin dans le bucket (ex: "biens/abc-123"). */
  pathPrefix: string;
  /** Nombre max d'images. Défaut : 20. Mettre 1 pour single. */
  maxFiles?: number;
  /** Désactive interactions. */
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  pathPrefix,
  maxFiles = 20,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState<number>(0);
  const [errors, setErrors] = React.useState<string[]>([]);

  const remainingSlots = Math.max(0, maxFiles - value.length);
  const isFull = remainingSlots === 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Upload séquentiel pour ne pas saturer le réseau ni Supabase
  async function handleFiles(files: File[]) {
    if (disabled || isFull) return;
    setErrors([]);
    const toUpload = files.slice(0, remainingSlots);
    setUploading(toUpload.length);

    const newUrls: string[] = [];
    const newErrors: string[] = [];

    for (const file of toUpload) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathPrefix", pathPrefix);
      try {
        const result = await uploadAdminImage(formData);
        if (result.ok) {
          newUrls.push(result.url);
        } else {
          newErrors.push(`${file.name} : ${result.error}`);
        }
      } catch (e) {
        newErrors.push(
          `${file.name} : ${e instanceof Error ? e.message : "erreur inconnue"}`,
        );
      }
      setUploading((n) => n - 1);
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
    },
    maxFiles: remainingSlots,
    disabled: disabled || isFull,
    onDrop: handleFiles,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  function handleRemove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  function handleSetCover(url: string) {
    if (value[0] === url) return;
    const next = [url, ...value.filter((u) => u !== url)];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Grille des images existantes */}
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {value.map((url, i) => (
                <ImageTile
                  key={url}
                  url={url}
                  isCover={i === 0}
                  disabled={disabled}
                  onRemove={() => handleRemove(url)}
                  onSetCover={() => handleSetCover(url)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dropzone */}
      {!isFull && (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-stone-200 hover:border-primary/50 hover:bg-primary/5",
            disabled && "opacity-50 pointer-events-none",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {uploading > 0 ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="text-sm font-medium text-neutral-900">
            {uploading > 0 ? (
              <>Envoi en cours… ({uploading} restant{uploading > 1 ? "s" : ""})</>
            ) : isDragActive ? (
              "Déposez les images ici"
            ) : (
              "Glissez-déposez ou cliquez pour ajouter"
            )}
          </div>
          <div className="text-xs text-neutral-500">
            JPG, PNG, WebP, AVIF · max 8 Mo · {remainingSlots} restante
            {remainingSlots > 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* État "plein" */}
      {isFull && (
        <p className="text-xs text-neutral-500 text-center">
          Limite atteinte ({maxFiles} images). Supprimez-en une pour en ajouter.
        </p>
      )}

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-700">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- ImageTile : une tuile draggable ----------

function ImageTile({
  url,
  isCover,
  disabled,
  onRemove,
  onSetCover,
}: {
  url: string;
  isCover: boolean;
  disabled?: boolean;
  onRemove: () => void;
  onSetCover: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-lg border bg-stone-100",
        isCover ? "border-primary ring-1 ring-primary" : "border-stone-200",
      )}
    >
      <Image
        src={url}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        className="object-cover"
      />

      {/* Badge "Cover" */}
      {isCover && (
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          <Star className="h-2.5 w-2.5 fill-current" />
          Cover
        </div>
      )}

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Réorganiser"
        disabled={disabled}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Actions bas (hover) */}
      <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
        {!isCover ? (
          <button
            type="button"
            onClick={onSetCover}
            className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-white"
            disabled={disabled}
          >
            <StarOff className="h-3 w-3" />
            Définir cover
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-md bg-red-500/90 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-600"
          disabled={disabled}
          aria-label="Supprimer cette image"
        >
          <Trash2 className="h-3 w-3" />
          Supprimer
        </button>
      </div>
    </div>
  );
}
