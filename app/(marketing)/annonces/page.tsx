import React from "react";
import Link from "next/link";
import { getActiveAnnonces } from "@/src/actions/public";
import { Megaphone, Sparkles, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmplacementPub } from "@/components/publicites/emplacement-pub";
import { AnnoncesGrid } from "./_components/annonces-grid";

export const dynamic = "force-dynamic";

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
        
        {/* Header chic (Rétabli à la version d'origine demandée) */}
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

        <EmplacementPub cle="annonces-haut" className="mb-12" />

        {/* GRILLE DES ANNONCES (Nouvelle version avec les cards animées) */}
        {isEmpty ? (
          <EmptyAnnonces />
        ) : (
          <AnnoncesGrid annonces={annonces} />
        )}
      </div>

      {/* SECTION NEWSLETTER / ALERTE (Conservée car elle termine bien la page) */}
      <section className="mt-24 sm:mt-32 pt-24 pb-10 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
            <BellRing className="h-8 w-8" />
          </div>
          <h2 className="font-agate text-4xl font-bold text-secondary mb-6">
            Ne manquez aucune opportunité
          </h2>
          <p className="text-lg text-neutral-600 mb-10 max-w-2xl mx-auto">
            Confiez-nous vos critères de recherche et soyez alerté en avant-première de nos nouvelles exclusivités avant leur publication.
          </p>
          <Button asChild size="lg" className="rounded-full px-10 h-14 bg-secondary text-white hover:bg-secondary/90 text-base shadow-xl">
            <Link href="/contact_us">
              Créer une alerte personnalisée
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function EmptyAnnonces() {
  return (
    <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm max-w-3xl mx-auto">
      <div className="p-12 sm:p-16 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF5EE] text-[#F5B324] mb-6">
          <Megaphone className="h-10 w-10" />
        </div>
        <h2 className="font-agate text-3xl sm:text-4xl font-bold text-secondary mb-4">
          Pas d'opportunité immédiate
        </h2>
        <p className="text-neutral-600 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Nos promotions et exclusivités sont éphémères. En attendant nos prochaines annonces, nous vous invitons à parcourir notre catalogue complet.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="rounded-full h-14 px-8 bg-[#1B3C35] hover:bg-[#152e29] text-white">
            <Link href="/properties">Parcourir le catalogue</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 border-stone-300 text-stone-700 hover:bg-stone-50">
            <Link href="/services">Nos services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
