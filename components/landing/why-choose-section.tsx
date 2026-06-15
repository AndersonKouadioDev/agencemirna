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
import { MotionSection } from "./motion-section";

/**
 * "Pourquoi nous" — grille BENTO dense (plus de vide) :
 *   ┌───────────────┬───────────────┐
 *   │ Image équipe  │ Atouts (liste)│   (2 blocs 2×2)
 *   ├───────┬───────┼───────┬───────┤
 *   │ chiffre│chiffre│chiffre│chiffre│  (4 cartes, 1 orange)
 *   └───────┴───────┴───────┴───────┘
 */

const ATOUTS = [
  { icon: Award, label: "Expérience depuis 2022" },
  { icon: ShieldCheck, label: "Mandats transparents" },
  { icon: Users, label: "Experts abidjanais" },
  { icon: BadgeCheck, label: "Biens vérifiés" },
  { icon: Clock, label: "Réponse sous 24h" },
  { icon: HeartHandshake, label: "Accompagnement A à Z" },
];

export default async function WhyChooseSection() {
  const counts = await getSiteStats();
  const ageAgence = Math.max(new Date().getFullYear() - 2022, 1);

  const STATS = [
    { value: String(ageAgence), suffix: " ans", label: "D'expérience", accent: false },
    { value: "100", suffix: "+", label: "Clients accompagnés", accent: true },
    { value: String(counts.biens_actifs), suffix: "", label: "Biens au catalogue", accent: false },
    { value: String(counts.services_actifs), suffix: "", label: "Services métier", accent: false },
  ];

  return (
    <MotionSection as="section" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* En-tête compact */}
        <div className="mb-8 max-w-2xl">
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary/50" />
            Pourquoi Agence Mirna
          </span>
          <h2 className="mt-3 font-agate text-3xl font-bold leading-[1.05] tracking-tight text-secondary sm:text-4xl lg:text-5xl">
            Le bon partenaire fait{" "}
            <span className="text-primary">toute la différence</span>
          </h2>
        </div>

        {/* Bento */}
        <div className="grid auto-rows-[8.5rem] grid-cols-2 gap-3 sm:auto-rows-[10rem] sm:gap-4 lg:grid-cols-4">
          {/* Image équipe */}
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5">
            <Image
              src="/images/photos/team.jpg"
              alt="L'équipe d'Agence Mirna"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Fondée en 2022 · Abidjan
              </p>
              <p className="mt-1 font-agate text-xl font-bold leading-tight sm:text-2xl">
                Une équipe qui connaît le terrain
              </p>
            </div>
          </div>

          {/* Carte atouts */}
          <div className="col-span-2 row-span-2 flex flex-col rounded-3xl border border-stone-200 bg-[#FAF5EE] p-5 shadow-sm sm:p-6">
            <p className="text-sm leading-relaxed text-neutral-600">
              De la recherche à la signature, notre rigueur et notre
              connaissance du marché abidjanais au service de votre projet.
            </p>
            <div className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-3 content-center">
              {ATOUTS.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[13px] font-medium leading-tight text-secondary">
                      {a.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/about"
              className="group mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-secondary"
            >
              <span className="border-b-2 border-primary pb-0.5 transition-colors group-hover:text-primary">
                Notre histoire
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Cartes chiffres */}
          {STATS.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col justify-center rounded-3xl p-5 shadow-sm ring-1",
                s.accent
                  ? "bg-primary text-secondary ring-primary/20"
                  : "bg-[#FAF5EE] text-secondary ring-black/5",
              )}
            >
              <div className="font-agate text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl">
                {s.value}
                <span className={s.accent ? "text-white" : "text-primary"}>
                  {s.suffix}
                </span>
              </div>
              <div
                className={cn(
                  "mt-2 text-[11px] font-semibold uppercase tracking-[0.12em]",
                  s.accent ? "text-secondary/80" : "text-neutral-500",
                )}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
