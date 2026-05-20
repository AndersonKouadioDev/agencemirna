"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section "Ils nous font confiance" — carousel témoignages clients.
 * 3 témoignages plausibles (propriétaire bailleur, locataire expat,
 * investisseur). Fond marron foncé (secondary) pour rythmer la page.
 *
 * À terme : remplaçable par un fetch Supabase d'une table `testimonials`.
 */

const TESTIMONIALS = [
  {
    quote:
      "L'Agence Mirna a géré la location de mon appartement à Marcory de A à Z. Trouvaille de locataires sérieux en moins de 2 semaines, état des lieux digital, virement à date fixe. Je recommande sans hésiter.",
    name: "Aïcha K.",
    role: "Propriétaire bailleur · Marcory Zone 4",
    initials: "AK",
    rating: 5,
  },
  {
    quote:
      "Expat français récemment muté à Abidjan, j'avais besoin d'un studio meublé clé en main. Mirna m'a trouvé un bien à Cocody en 4 jours, visite virtuelle, contrat signé à distance. Service vraiment premium.",
    name: "Thomas R.",
    role: "Directeur Commercial · Expatrié",
    initials: "TR",
    rating: 5,
  },
  {
    quote:
      "J'investis dans l'immo résidentiel depuis 5 ans. Mirna est la seule agence d'Abidjan qui m'a présenté un dossier complet avec rentabilité brute, charges, comparables. Du sérieux.",
    name: "Yves M.",
    role: "Investisseur · Plateau-Abidjan",
    initials: "YM",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section className="relative bg-secondary text-white py-20 sm:py-28 overflow-hidden">
      {/* Décor radial */}
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
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Témoignages
          </p>
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Ils nous font confiance
          </h2>
          <p className="mt-4 text-base text-white/75 max-w-xl mx-auto">
            Propriétaires, locataires, investisseurs : ce qu'ils disent de
            leur expérience avec l'Agence Mirna.
          </p>
        </div>

        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="shrink-0 grow-0 basis-full px-2 sm:px-6">
                <div className="rounded-3xl bg-white/5 backdrop-blur border border-white/10 p-8 sm:p-12 text-center">
                  {/* Stars */}
                  <div className="flex justify-center gap-0.5 mb-6">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star
                        key={k}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <blockquote className="font-agate text-xl sm:text-2xl md:text-3xl leading-snug text-white mb-8 max-w-3xl mx-auto">
                    « {t.quote} »
                  </blockquote>
                  {/* Author */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                      {t.initials}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">
                        {t.name}
                      </div>
                      <div className="text-xs text-white/65">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
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
            {TESTIMONIALS.map((_, i) => (
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
      </div>
    </section>
  );
}
