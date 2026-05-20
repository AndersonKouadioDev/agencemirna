import Image from "next/image";
import Motion from "@/components/motion";
import { ImageOff } from "lucide-react";

/**
 * Galerie de photos d'un bien sur la fiche détail.
 * Layout : 1 grande image à gauche + grille 2×2 d'images à droite.
 * Utilise `bien.images` (array d'URLs) chargé par getBienWithImages().
 */
export default function GallerySection({ bien }: { bien: any }) {
  const images: string[] = Array.isArray(bien?.images) ? bien.images : [];
  const propertyName = bien?.name ?? "Propriété";

  if (images.length === 0) {
    return null;
  }

  // Layout : 1 large + 4 petites maximum
  const cover = images[0];
  const thumbs = images.slice(1, 5);
  const extra = Math.max(0, images.length - 5);

  return (
    <section
      id="gallery"
      className="relative bg-primary/5 isolate pt-32 pb-20 mx-auto max-w-screen-xl"
    >
      <div className="container relative w-full">
        <Motion variant="verticalSlideIn">
          <h2 className="text-2xl text-center mx-auto max-w-2xl sm:text-3xl font-agate md:text-5xl font-bold">
            Galerie de la propriété
          </h2>
        </Motion>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Image principale (cover) — toujours aspect 4/3 pour aligner
              naturellement avec la grille 2×2 d'à côté */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg group">
            <Image
              src={cover}
              alt={`${propertyName} — photo principale`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>

          {/* Grille des 4 autres images */}
          {thumbs.length > 0 ? (
            <div className="grid grid-cols-2 gap-5">
              {thumbs.map((url, i) => {
                const isLast = i === thumbs.length - 1 && extra > 0;
                return (
                  <div
                    key={url}
                    className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-md group"
                  >
                    <Image
                      src={url}
                      alt={`${propertyName} — photo ${i + 2}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay "+N" sur la dernière image s'il y en a plus */}
                    {isLast && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-2xl font-semibold">
                        +{extra}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Placeholder pour compléter la grille 2x2 si moins de 4 thumbs */}
              {Array.from({ length: Math.max(0, 4 - thumbs.length) }).map(
                (_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="aspect-[4/3] rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-stone-300"
                  >
                    <ImageOff className="h-8 w-8" />
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
