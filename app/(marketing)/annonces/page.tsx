
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getActiveAnnonces } from "@/src/actions/public";
import { Clock, Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Annonces & Promotions | Mirna",
  description: "Découvrez nos offres exclusives, nos promotions en cours et nos dernières nouveautés.",
};

export default async function AnnoncesPage() {
  const annonces = await getActiveAnnonces();
  const isEmpty = !annonces || annonces.length === 0;

  return (
    <main className="min-h-screen bg-[#FAF5EE] pt-40 sm:pt-48 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Header chic */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-6 flex items-center justify-center gap-2">
            Opportunités <Sparkles className="h-4 w-4" />
          </span>
          <h1 className="font-agate text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">
            Annonces & Promotions
          </h1>
          <p className="text-stone-600 text-lg">
            Saisissez l'instant avec nos offres exclusives, nouveautés et promotions
            limitées sur nos biens d'exception.
          </p>
        </div>

        {isEmpty ? (
          <EmptyAnnonces />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {annonces.map((annonce) => (
              <AnnonceCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AnnonceCard({ annonce }: { annonce: any }) {
  // Parse description as JSON for advanced fields
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

  // Couleurs du badge selon le type
  let badgeColor = "bg-[#1B3C35]"; // NOUVEAU
  if (type === "PROMOTION") badgeColor = "bg-red-500";
  if (type === "EXCLUSIVITÉ") badgeColor = "bg-[#F5B324]";

  const ctaLink = annonce.cta_url || "/properties";

  return (
    <Link href={ctaLink} className="group block h-full">
      <div className="bg-[#FAF5EE] rounded-[2rem] overflow-hidden h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={annonce.image}
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
          
          <div className="mt-auto pt-4 border-t border-stone-200 flex flex-col">
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
  );
}

function EmptyAnnonces() {
  return (
    <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
      <div className="p-12 sm:p-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF5EE] text-[#F5B324] mb-6">
          <Megaphone className="h-7 w-7" />
        </div>
        <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary mb-2">
          Pas d'opportunité en cours
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto mb-6">
          Nos prochaines annonces arrivent bientôt. En attendant, découvrez nos biens d'exception.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full bg-[#1B3C35] hover:bg-[#152e29] text-white">
            <Link href="/properties">Voir les biens</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full hover:bg-stone-100 border-stone-300">
            <Link href="/services">Nos services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
