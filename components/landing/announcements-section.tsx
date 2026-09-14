
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveAnnonces } from "@/src/actions/public";
import AnnonceCard from "@/components/annonces/annonce-card";

export default async function AnnouncementsSection() {
  // `show_on_home` SÉLECTIONNE les annonces de cette section, mais ne la
  // gouverne pas entièrement : tant qu'aucune annonce n'est cochée, le repli
  // ci-dessous évite un accueil amputé de sa section « Opportunités ».
  // Conséquence à connaître avant de relire la case en back-office : décocher
  // la dernière annonce cochée ne la fait pas disparaître de l'accueil.
  let annonces = await getActiveAnnonces({ onHome: true, limit: 3 });
  if (annonces.length === 0) annonces = await getActiveAnnonces({ limit: 3 });
  if (annonces.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
              Opportunités <span>✦</span>
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Annonces &amp; Promotions
            </h2>
          </div>
          <Link
            href="/annonces"
            className="flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-primary transition-colors"
          >
            Voir toutes les offres
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {annonces.map((annonce) => (
            <AnnonceCard key={annonce.id} annonce={annonce} />
          ))}
        </div>
      </div>
    </section>
  );
}
