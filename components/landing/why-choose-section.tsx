import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Users,
  BadgeCheck,
  Clock,
  HeartHandshake,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSiteStats } from "@/src/actions/admin/taxonomy";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * "Pourquoi nous" — composition menée par les CHIFFRES (identité propre) :
 *   - En-tête éditorial serif large
 *   - Image équipe + atouts en liste à filets (pas de pills génériques)
 *   - Bande de chiffres SURDIMENSIONNÉS (depuis getSiteStats)
 *
 * Fond cream. Chiffre clients unifié à 100+ (cohérent hero / partenaires).
 */

const ATOUTS = [
  { icon: Award, label: "Expérience locale depuis 2022" },
  { icon: ShieldCheck, label: "Mandats sérieux & transparents" },
  { icon: Users, label: "Équipe d'experts abidjanais" },
  { icon: BadgeCheck, label: "Biens vérifiés & de qualité" },
  { icon: Clock, label: "Réponse sous 24h ouvrées" },
  { icon: HeartHandshake, label: "Accompagnement de A à Z" },
];

export default async function WhyChooseSection() {
  const counts = await getSiteStats();
  const ageAgence = Math.max(new Date().getFullYear() - 2022, 1);

  const STATS = [
    { value: String(ageAgence), suffix: " ans", label: "D'expérience" },
    { value: "100", suffix: "+", label: "Clients accompagnés" },
    { value: String(counts.biens_actifs), suffix: "", label: "Biens au catalogue" },
    { value: String(counts.services_actifs), suffix: "", label: "Services métier" },
  ];

  return (
    <MotionSection as="section" className="bg-primary/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* En-tête éditorial */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary/50" />
            Pourquoi Agence Mirna
          </span>
          <h2 className="mt-5 font-agate text-4xl font-bold leading-[1.02] tracking-tight text-secondary sm:text-5xl lg:text-[3.5rem]">
            Le bon partenaire fait{" "}
            <span className="italic text-primary">toute la différence</span>
          </h2>
        </div>

        {/* Image + atouts */}
        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-2xl">
              <Image
                src="/images/photos/team.jpg"
                alt="L'équipe d'Agence Mirna"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-5 left-5 rounded-2xl border border-stone-100 bg-white/95 px-5 py-3 shadow-xl backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Fondée en 2022
              </p>
              <p className="mt-0.5 font-agate text-lg font-bold text-secondary">
                À Abidjan, pour Abidjan
              </p>
            </div>
          </div>

          {/* Atouts en liste à filets */}
          <div>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-600">
              De la recherche à la signature, nous mettons notre connaissance
              du marché abidjanais et notre rigueur au service de votre projet.
            </p>

            <MotionStagger className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {ATOUTS.map((atout) => {
                const Icon = atout.icon;
                return (
                  <MotionStaggerChild key={atout.label}>
                    <div className="flex items-start gap-3 border-t border-stone-200 pt-4">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-[15px] font-medium leading-snug text-secondary">
                        {atout.label}
                      </span>
                    </div>
                  </MotionStaggerChild>
                );
              })}
            </MotionStagger>

            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"
            >
              <span className="border-b-2 border-primary pb-1 transition-colors group-hover:text-primary">
                Découvrir notre histoire
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Bande de chiffres surdimensionnés */}
        <div className="mt-20 grid grid-cols-2 gap-y-10 border-t border-stone-200 pt-14 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "px-2 text-center",
                i > 0 && "lg:border-l lg:border-stone-200",
                i % 2 !== 0 && "border-l border-stone-200 lg:border-l",
              )}
            >
              <div className="font-agate text-5xl font-bold leading-none tracking-tight text-secondary tabular-nums sm:text-6xl lg:text-7xl">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
