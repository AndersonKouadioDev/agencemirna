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
import { deleteAdminImage, signerEnvoiImage } from "@/src/actions/admin/upload";

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
  /**
   * Nombre de fichiers encore en cours d'envoi, à chaque variation.
   * `onChange` n'est appelé qu'une fois le lot complet monté : sans cette
   * remontée, le formulaire parent laissait son bouton « Enregistrer » actif
   * et soumettait la liste d'images INCHANGÉE, perdant tout le lot.
   */
  onUploadingChange?: (enCours: number) => void;
}

export function ImageUploader({
  value,
  onChange,
  pathPrefix,
  maxFiles = 20,
  disabled = false,
  onUploadingChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState<number>(0);
  const [errors, setErrors] = React.useState<string[]>([]);

  const remainingSlots = Math.max(0, maxFiles - value.length);
  const isFull = remainingSlots === 0;

  // `value` est capturé à l'entrée de `handleFiles`, qui dure le temps de
  // l'envoi : deux dépôts successifs repartaient tous deux de la même liste,
  // et le second `onChange` écrasait le lot du premier.
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Chemins Storage des fichiers montés depuis ce montage du composant. Ils
  // n'ont encore aucune ligne en base : les retirer du formulaire les rendrait
  // définitivement orphelins dans le bucket sans cet inventaire.
  const cheminsEnvoyes = React.useRef(new Map<string, string>());

  const onUploadingChangeRef = React.useRef(onUploadingChange);
  React.useEffect(() => {
    onUploadingChangeRef.current = onUploadingChange;
  }, [onUploadingChange]);
  React.useEffect(() => {
    onUploadingChangeRef.current?.(uploading);
  }, [uploading]);

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
    if (disabled || isFull || uploading > 0) return;
    setErrors([]);
    const toUpload = files.slice(0, remainingSlots);
    setUploading(toUpload.length);

    const newUrls: string[] = [];
    const newErrors: string[] = [];

    for (const file of toUpload) {
      try {
        // Le fichier ne passe plus par le serveur Next : on demande une URL
        // signée, puis on écrit directement dans le Storage. Traverser une
        // Server Action plafonnait l'envoi à 1 Mo (et à 4,5 Mo sur Vercel),
        // alors que l'interface annonce 8 Mo — un PNG de 3 Mo était refusé
        // avec un message technique incompréhensible pour le rédacteur.
        const signature = await signerEnvoiImage({
          pathPrefix,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        });

        if (!signature.ok) {
          newErrors.push(`${file.name} : ${signature.error}`);
          setUploading((n) => n - 1);
          continue;
        }

        const reponse = await fetch(signature.signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            // Les noms de fichier sont uniques : le cache peut être long.
            "Cache-Control": "31536000",
          },
          body: file,
        });

        if (!reponse.ok) {
          newErrors.push(
            `${file.name} : envoi refusé par le stockage (${reponse.status}).`,
          );
        } else {
          newUrls.push(signature.publicUrl);
          cheminsEnvoyes.current.set(signature.publicUrl, signature.path);
        }
      } catch (e) {
        newErrors.push(
          `${file.name} : ${e instanceof Error ? e.message : "erreur inconnue"}`,
        );
      }
      setUploading((n) => n - 1);
    }

    if (newUrls.length > 0) {
      onChange([...valueRef.current, ...newUrls]);
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
    // Désactivée pendant un envoi : un second dépôt lançait un `handleFiles`
    // concurrent dont le résultat écrasait celui du premier.
    disabled: disabled || isFull || uploading > 0,
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
    onChange(valueRef.current.filter((u) => u !== url));
    // Fichier monté puis retiré avant l'enregistrement : aucune ligne ne le
    // référence, personne ne le supprimera jamais. On l'efface tout de suite.
    // Les images déjà enregistrées, elles, restent au bucket tant que le save
    // n'a pas confirmé leur retrait.
    const chemin = cheminsEnvoyes.current.get(url);
    if (chemin) {
      cheminsEnvoyes.current.delete(url);
      void deleteAdminImage(chemin).catch(() => {});
    }
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
              {value.map((url, i) =>
                // next/image ne sait rien faire d'une source vide : il rend un
                // <img src=""> étalé sur toute la tuile. Une liste venue de la
                // base peut en contenir une, la grille ne doit pas casser pour
                // autant — l'entrée est sautée, les rangs restent justes.
                url.trim() === "" ? null : (
                  <ImageTile
                    key={url}
                    url={url}
                    isCover={i === 0}
                    disabled={disabled || uploading > 0}
                    onRemove={() => handleRemove(url)}
                    onSetCover={() => handleSetCover(url)}
                  />
                ),
              )}
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
              <>
                Envoi en cours… ({uploading} restant{uploading > 1 ? "s" : ""})
              </>
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
