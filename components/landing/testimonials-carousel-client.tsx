"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  avatar_initials: string | null;
  rating: number;
};

/**
 * Carousel client des témoignages. Reçoit la liste depuis le wrapper
 * server (TestimonialsSection) qui fetch depuis Supabase.
 */
export default function TestimonialsCarouselClient({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: testimonials.length > 1,
    align: "center",
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  if (testimonials.length === 0) return null;

  return (
    <section className="relative bg-secondary text-white py-20 sm:py-28 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 30%, hsl(var(--primary)) 0, transparent 30%), radial-gradient(circle at 85% 70%, hsl(var(--primary)) 0, transparent 30%)",
        }}
      />
      <Quote
        aria-hidden
        className="absolute top-12 left-8 h-32 w-32 text-primary/10 -rotate-12"
      />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary/50" />
            Témoignages
            <span className="h-px w-8 bg-primary/50" />
          </span>
          <h2 className="mt-5 font-agate text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.02] tracking-tight">
            Ils nous font confiance
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            Propriétaires, locataires, investisseurs : ce qu&apos;ils disent de
            leur expérience avec l&apos;Agence Mirna.
          </p>
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {testimonials.map((t) => (
              <div key={t.id} className="shrink-0 grow-0 basis-full px-2 sm:px-6">
                <div className="rounded-3xl bg-white/5 backdrop-blur border border-white/10 p-8 sm:p-12 text-center">
                  <div className="flex justify-center gap-0.5 mb-6">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star
                        key={k}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <blockquote className="font-agate text-xl sm:text-2xl md:text-3xl leading-snug text-white mb-8 max-w-3xl mx-auto">
                    « {t.quote} »
                  </blockquote>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                      {t.avatar_initials ?? initialsFromName(t.author_name)}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">
                        {t.author_name}
                      </div>
                      {t.author_role && (
                        <div className="text-xs text-white/65">{t.author_role}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Témoignage précédent"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur text-white hover:bg-white/10 hover:border-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Témoignage ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === selectedIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-white/30 hover:bg-white/50",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Témoignage suivant"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur text-white hover:bg-white/10 hover:border-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
