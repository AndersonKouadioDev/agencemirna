import Marquee from "@/components/magicui/marquee";
import Image from "next/image";

/**
 * Section partenaires : marquee infini avec logos couleur, hover pause.
 * - Header serif Editorial Luxury (cohérence avec le reste de la page)
 * - Logos h-12 sm:h-16 (avant h-14/16/20 trop petit)
 * - Couleurs originales (avant grayscale invisible)
 * - Hover : scale-110 + opacity full
 * - Marquee dupliqué pour défilement continu sans saut
 */

const PARTNERS = [
  { src: "/images/partenaires/partenaire1.jpeg", alt: "Partenaire 1" },
  { src: "/images/partenaires/partenaire2.jpeg", alt: "Partenaire 2" },
  { src: "/images/partenaires/partenaire3.png", alt: "Partenaire 3" },
  { src: "/images/partenaires/partenaire4.jpg", alt: "Partenaire 4" },
  { src: "/images/partenaires/partenaire5.jpg", alt: "Partenaire 5" },
  { src: "/images/partenaires/partenaire6.png", alt: "Partenaire 6" },
  { src: "/images/partenaires/partenaire7.png", alt: "Partenaire 7" },
  { src: "/images/partenaires/partenaire8.svg", alt: "Partenaire 8" },
];

export default function ClientSection() {
  return (
    <section id="clients" className="bg-[#FAF5EE] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Ils nous font confiance
          </p>
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
            Plus de 100 clients & partenaires
          </h2>
          <p className="mt-4 text-base text-neutral-700 leading-relaxed">
            Particuliers, expatriés, entreprises et institutions :
            l'Agence Mirna accompagne toutes les ambitions immobilières.
          </p>
        </div>

        {/* Marquee logos */}
        <div className="relative">
          {/* Gradient fade left/right */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#FAF5EE] to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#FAF5EE] to-transparent"
          />

          <Marquee className="max-w-full [--duration:50s] [--gap:3rem] py-4">
            {PARTNERS.map((p, i) => (
              <div
                key={i}
                className="group flex items-center justify-center h-16 sm:h-20 w-28 sm:w-36 shrink-0"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={140}
                  height={80}
                  className="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
