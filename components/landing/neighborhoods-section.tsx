import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const NEIGHBORHOODS = [
  {
    id: "cocody",
    name: "Cocody",
    subtitle: "Le prestige et la verdure",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    href: "/properties?loc=Cocody",
  },
  {
    id: "marcory",
    name: "Zone 4 & Marcory",
    subtitle: "L'effervescence urbaine",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800",
    href: "/properties?loc=Marcory",
  },
  {
    id: "assinie",
    name: "Assinie",
    subtitle: "L'évasion en bord de mer",
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=800",
    href: "/properties?loc=Assinie",
  }
];

export default function NeighborhoodsSection({ quartiers = [] }: { quartiers?: any[] }) {
  const featuredQuartiers = quartiers && quartiers.length > 0 ? quartiers.filter((q: any) => q.is_featured).slice(0, 3) : NEIGHBORHOODS;

  return (
    <section className="py-16 md:py-20 bg-black">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
              Emplacements <span>✦</span>
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-white leading-tight">
              Quartiers Phares
            </h2>
          </div>
          <Link href="/properties" className="flex items-center gap-1.5 text-sm font-bold text-white/80 hover:text-white transition-colors">
            Découvrir tous nos biens
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {featuredQuartiers.map((area) => (
            <Link
              key={area.id}
              href={area.href || `/properties?location=${encodeURIComponent(area.search_query || area.name || "")}`}
              className="group relative rounded-[2rem] overflow-hidden aspect-[4/3] md:aspect-square lg:aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-500 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Image
                src={area.image}
                alt={area.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3C35]/90 via-[#1B3C35]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-2xl md:text-3xl text-white mb-2">{area.name}</h3>
                <p className="text-white/80 font-medium">{area.tagline || area.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
