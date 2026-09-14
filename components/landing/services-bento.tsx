import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HardHat, Home, BedDouble, Building2 } from "lucide-react";

/**
 * Même arbitrage que services-showcase : Construction et Gestion locative
 * n'ont aucun bien au catalogue, leurs tuiles renvoient donc à leur page de
 * service et non à un filtre `?service=` qui donnerait une liste vide.
 */
const BENTO_ITEMS = [
  {
    id: "vente",
    title: "Vente de biens d'exception",
    desc: "Trouvez la maison de vos rêves parmi notre sélection exclusive et rigoureusement vérifiée.",
    icon: Home,
    href: "/services/vente",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    id: "construction",
    title: "Construction & Rénovation",
    desc: "Des projets bâtis de A à Z par nos experts en architecture et ingénierie.",
    icon: HardHat,
    href: "/services/construction",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
    className: "md:col-span-1 md:row-span-2",
  },
  {
    id: "meubles",
    title: "Appartements Meublés",
    desc: "Le confort absolu pour vos séjours.",
    icon: BedDouble,
    href: "/services/location-meublee",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: "gestion",
    title: "Gestion Locative",
    desc: "Rentabilisez votre patrimoine en toute sérénité.",
    icon: Building2,
    href: "/services/gestion-immobiliere",
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=800",
    className: "md:col-span-1 md:row-span-1",
  }
];

export default function ServicesBento() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
            Nos Services <span>✦</span>
          </span>
          <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight max-w-2xl">
            Une expertise complète pour votre patrimoine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-8 auto-rows-[320px] md:auto-rows-[400px] lg:auto-rows-[450px]">
          {BENTO_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 md:p-10 lg:p-12 outline-none focus-visible:ring-2 focus-visible:ring-primary ${item.className}`}
            >
              <div className="absolute inset-0 bg-stone-200">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              {/* Dark gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3C35]/90 via-[#1B3C35]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl mb-6 group-hover:bg-[#F5B324] transition-colors">
                  <item.icon className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-2xl md:text-3xl lg:text-4xl text-white mb-3 md:mb-4 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base lg:text-lg font-medium text-white/90 line-clamp-2 md:line-clamp-none max-w-[95%]">
                  {item.desc}
                </p>
              </div>
              
              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 lg:bottom-12 lg:right-12 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <div className="bg-[#F5B324] text-secondary rounded-full p-3 shadow-lg">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
