import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Teaser éditorial "Pourquoi Choisir Agence Mirna" : version courte pour la home.
 * Le contenu détaillé (histoire, équipe, valeurs) est sur /about (page dédiée).
 *
 * Layout cohérent avec les autres sections : full-width bg + container max-w-7xl
 * interne (uniformisation Editorial Luxury). Padding harmonisé py-20 sm:py-28.
 *
 * Refactor (mai 2026) : ancien layout avec md:-ml-[50vw] qui débordait,
 * background blanc absolu et padding py-32 → remplacé par grid 2 colonnes
 * standard + image avec margin homogène + CTA vers /about.
 */

const REASONS = [
  "Expertise locale du marché abidjanais",
  "Service personnalisé sur mesure",
  "Équipe dévouée et certifiée",
  "Approche moderne & transparente",
];

export default function AboutSection() {
  return (
    <MotionSection
      as="section"
      id="about"
      className="bg-primary/5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Texte gauche */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Pourquoi Agence Mirna
            </p>
            <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Plus qu'une agence,{" "}
              <span className="italic text-primary">un partenaire</span>.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-neutral-700 leading-relaxed">
              Fondée en 2022 par Madame Barry Néné Yéro, l'Agence Mirna est
              devenue un acteur dynamique du marché immobilier d'Abidjan.
              Nous créons des expériences sur mesure, adaptées à vos rêves
              et à vos objectifs.
            </p>

            <MotionStagger className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REASONS.map((r) => (
                <MotionStaggerChild key={r}>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-neutral-800">{r}</span>
                  </div>
                </MotionStaggerChild>
              ))}
            </MotionStagger>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-full h-12 px-6">
                <Link href="/about">
                  Découvrir notre histoire
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full h-12 px-6"
              >
                <Link href="/services">Nos services</Link>
              </Button>
            </div>
          </div>

          {/* Image droite */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/biens/bien15.jpg"
                alt="Agence Mirna : Marcory Zone 4"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Card flottante */}
            <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white rounded-2xl shadow-xl p-5 max-w-[240px] border border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Fondatrice
              </p>
              <p className="font-agate text-lg text-secondary leading-snug">
                Madame Barry Néné Yéro
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Directrice générale
              </p>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
