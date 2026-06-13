import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Users,
  BadgeCheck,
  Clock,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Section "Pourquoi nous choisir" (inspirée du bloc "Why Choose Us") :
 *   - Image à gauche (équipe / agent)
 *   - Grille d'atouts à droite, chaque atout en pill avec icône
 *   - CTA vers /about
 *
 * Fond cream (primary/5) cohérent avec le design Editorial Luxury.
 */

const ATOUTS = [
  { icon: Award, label: "Expérience locale depuis 2022" },
  { icon: ShieldCheck, label: "Mandats sérieux & transparents" },
  { icon: Users, label: "Équipe d'experts abidjanais" },
  { icon: BadgeCheck, label: "Biens vérifiés & de qualité" },
  { icon: Clock, label: "Réponse sous 24h ouvrées" },
  { icon: HeartHandshake, label: "Accompagnement de A à Z" },
];

export default function WhyChooseSection() {
  return (
    <MotionSection as="section" className="bg-primary/5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/images/photos/team.jpg"
                alt="L'équipe d'Agence Mirna"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Badge flottant */}
            <div className="absolute -bottom-5 -right-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl sm:-right-6">
              <p className="font-agate text-3xl font-bold leading-none text-primary">
                100<span className="text-secondary">+</span>
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                clients accompagnés
              </p>
            </div>
          </div>

          {/* Atouts */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Pourquoi Agence Mirna
            </p>
            <h2 className="font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
              Le bon partenaire fait{" "}
              <span className="italic text-primary">toute la différence</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700">
              De la recherche à la signature, nous mettons notre connaissance
              du marché abidjanais et notre rigueur au service de votre projet.
            </p>

            <MotionStagger className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ATOUTS.map((atout) => {
                const Icon = atout.icon;
                return (
                  <MotionStaggerChild key={atout.label}>
                    <div className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-3 transition-colors hover:border-primary/40">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        {atout.label}
                      </span>
                    </div>
                  </MotionStaggerChild>
                );
              })}
            </MotionStagger>

            <div className="mt-10">
              <Link
                href="/about"
                className={cn(buttonVariants(), "h-12 px-6 text-base")}
              >
                Découvrir notre histoire
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
