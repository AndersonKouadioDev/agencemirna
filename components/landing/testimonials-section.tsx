import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Jean-Marc R.",
    role: "Acheteur",
    text: "Une équipe professionnelle qui a su trouver exactement ce que je cherchais à Cocody en un temps record. Le suivi après-vente est également irréprochable.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 2,
    name: "Sophie T.",
    role: "Investisseuse",
    text: "Je leur ai confié la gestion de mes deux appartements meublés en Zone 4. Tranquillité d'esprit garantie, locataires triés sur le volet. Je recommande vivement.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 3,
    name: "Marc & Valérie",
    role: "Vendeurs",
    text: "L'estimation était juste, et la mise en valeur de notre villa a permis une vente rapide au bon prix. Une véritable agence premium.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
  }
];

export default function TestimonialsSection({ testimonials = [] }: { testimonials?: any[] }) {
  const dynamicTestimonials = testimonials && testimonials.length > 0 ? testimonials : TESTIMONIALS;

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
          {dynamicTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#FAF5EE] rounded-[2rem] p-8 md:p-10 relative shadow-sm border border-stone-100/50"
            >
              <Quote className="absolute top-8 right-8 h-12 w-12 text-[#F5B324] opacity-20" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#F5B324] text-[#F5B324]" />
                ))}
              </div>
              
              <p className="text-stone-700 font-medium text-lg leading-relaxed mb-8 relative z-10">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="h-12 w-12 rounded-full overflow-hidden relative">
                  <Image
                    src={testimonial.avatar || "/images/placeholder-avatar.png"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">{testimonial.name}</h4>
                  <p className="text-sm font-medium text-stone-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
