import React from "react";
import { Star, Quote } from "lucide-react";
import type { PublicTestimonial } from "@/src/actions/public";

/**
 * Section « Ils nous ont fait confiance ».
 *
 * Le repli affichait trois avis inventés, attribués à des personnes nommées et
 * illustrés de portraits d'agence photo : présentés sous ce titre, ce sont des
 * allégations commerciales, pas un habillage. Sans témoignage en base, on
 * masque donc la section plutôt que de la meubler.
 */
export default function TestimonialsSection({
  testimonials = [],
}: {
  testimonials?: PublicTestimonial[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
            Preuve Sociale <span>✦</span>
          </span>
          <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight max-w-2xl">
            Ils nous ont fait confiance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => {
            // `rating` est la note réellement saisie : on n'affiche plus cinq
            // étoiles pleines quel que soit l'avis.
            const notePleine = Math.max(
              0,
              Math.min(5, Math.round(testimonial.rating ?? 5)),
            );
            return (
              <div
                key={testimonial.id}
                className="bg-[#FAF5EE] rounded-[2rem] p-8 md:p-10 relative shadow-sm border border-stone-100/50"
              >
                <Quote className="absolute top-8 right-8 h-12 w-12 text-[#F5B324] opacity-20" />

                <div
                  className="flex gap-1 mb-6"
                  aria-label={`Note : ${notePleine} sur 5`}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < notePleine
                          ? "h-4 w-4 fill-[#F5B324] text-[#F5B324]"
                          : "h-4 w-4 text-stone-300"
                      }
                    />
                  ))}
                </div>

                <p className="text-stone-700 font-medium text-lg leading-relaxed mb-8 relative z-10">
                  &laquo;&nbsp;{testimonial.quote}&nbsp;&raquo;
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  {/* Le schéma ne stocke que des initiales, pas de portrait. */}
                  <div className="h-12 w-12 rounded-full bg-[#1B3C35] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {testimonial.avatar_initials ??
                      testimonial.author_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary">
                      {testimonial.author_name}
                    </h4>
                    {testimonial.author_role && (
                      <p className="text-sm font-medium text-stone-500">
                        {testimonial.author_role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
