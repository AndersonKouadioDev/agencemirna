import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Clock } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { MotionSection } from "./motion-section";

/**
 * CTA final "Confiez-le à Agence Mirna" — carte 2 colonnes :
 *   - Gauche : énoncé + boutons compacts + ligne de réassurance, sur fond
 *     marron franc (pas de photo délavée derrière le texte)
 *   - Droite : vraie image nette (équipe) + badge flottant
 */
export default function CtaBannerSection() {
  return (
    <MotionSection as="section" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-secondary shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Colonne texte */}
          <div className="relative order-2 p-8 sm:p-12 lg:order-1 lg:p-16">
            {/* Halo chaud discret */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                <span className="h-px w-8 bg-primary/60" />
                Un projet immobilier ?
              </span>
              <h2 className="mt-5 font-agate text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Confiez-le à{" "}
                <span className="italic text-primary">Agence Mirna</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
                Vente, location, gestion, estimation : un expert vous répond
                sous 24h ouvrées pour donner vie à votre projet.
              </p>

              {/* Boutons compacts */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/estimation"
                  className={cn(buttonVariants(), "h-12 gap-2 px-6 text-sm shadow-lg")}
                >
                  Estimation gratuite
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact_us"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 gap-2 border-white/40 bg-white/5 px-6 text-sm text-white backdrop-blur hover:bg-white hover:text-secondary",
                  )}
                >
                  <Phone className="h-4 w-4" />
                  Nous contacter
                </Link>
              </div>

              {/* Ligne de réassurance */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/55">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Réponse sous 24h ouvrées
                </span>
                <a
                  href="tel:+2250143483131"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  01 43 483 131
                </a>
              </div>
            </div>
          </div>

          {/* Colonne image */}
          <div className="relative order-1 min-h-[280px] lg:order-2">
            <Image
              src="/images/photos/team.jpg"
              alt="L'équipe d'Agence Mirna"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Fondu vers le panneau texte (cohésion) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/10 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-secondary/90"
            />
            {/* Badge flottant */}
            <div className="absolute bottom-5 right-5 rounded-2xl border border-stone-100 bg-white/95 px-5 py-3 shadow-xl backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Depuis 2022
              </p>
              <p className="mt-0.5 font-agate text-lg font-bold text-secondary">
                100+ clients accompagnés
              </p>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
