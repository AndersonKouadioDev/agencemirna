
import React from "react";
import Link from "next/link";
import { getActiveAnnonces } from "@/src/actions/public";
import { Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnnonceCard from "@/components/annonces/annonce-card";

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
            Saisissez l&apos;instant avec nos offres exclusives, nouveautés et promotions
            limitées sur nos biens d&apos;exception.
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

function EmptyAnnonces() {
  return (
    <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
      <div className="p-12 sm:p-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF5EE] text-[#F5B324] mb-6">
          <Megaphone className="h-7 w-7" />
        </div>
        <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary mb-2">
          Pas d&apos;opportunité en cours
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto mb-6">
          Nos prochaines annonces arrivent bientôt. En attendant, découvrez nos biens d&apos;exception.
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
