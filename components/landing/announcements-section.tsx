
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getActiveAnnonces } from "@/src/actions/public";

export default async function AnnouncementsSection() {
  const annonces = await getActiveAnnonces();
  if (!annonces || annonces.length === 0) return null; // Don't show section if no annonces

  // Only take up to 3 for the homepage
  const displayAnnonces = annonces.slice(0, 3);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
              Opportunités <span>✦</span>
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Annonces & Promotions
            </h2>
          </div>
          <Link href="/annonces" className="flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-primary transition-colors">
            Voir toutes les offres
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {displayAnnonces.map((annonce) => {
            // Parse JSON metadata
            let type = "PROMOTION";
            let price = "";
            let oldPrice = "";
            let subtitle = "";

            try {
              if (annonce.description) {
                if (annonce.description.startsWith("{")) {
                  const parsed = JSON.parse(annonce.description);
                  type = parsed.type || "PROMOTION";
                  price = parsed.price || "";
                  oldPrice = parsed.oldPrice || "";
                  subtitle = parsed.subtitle || "";
                } else {
                  subtitle = annonce.description || "";
                }
              }
            } catch (e) {
              subtitle = annonce.description || "";
            }

            // Couleurs
            let badgeColor = "bg-[#1B3C35]";
            if (type === "PROMOTION") badgeColor = "bg-red-500";
            if (type === "EXCLUSIVITÉ") badgeColor = "bg-[#F5B324]";

            const ctaLink = annonce.cta_url || "/properties";

            return (
              <Link key={annonce.id} href={ctaLink} className="group block h-full">
                <div className="bg-[#FAF5EE] rounded-[2rem] overflow-hidden h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={annonce.image || "/images/placeholder.jpg"}
                      alt={annonce.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <Badge className={`absolute top-4 left-4 ${badgeColor} text-white border-none px-3 py-1 font-bold tracking-wide`}>
                      {type}
                    </Badge>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col grow">
                    <h3 className="font-bold text-xl text-secondary leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {annonce.title}
                    </h3>
                    
                    {subtitle && (
                      <div className="flex items-center gap-2 text-stone-500 text-sm font-medium mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{subtitle}</span>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-stone-200/60 flex flex-col">
                      {oldPrice && (
                        <span className="text-stone-400 line-through text-sm font-medium mb-0.5">
                          {oldPrice}
                        </span>
                      )}
                      {price && (
                        <span className="text-lg font-bold text-[#F5B324]">
                          {price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  );
}
