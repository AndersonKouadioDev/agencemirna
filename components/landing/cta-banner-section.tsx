import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { MotionSection } from "./motion-section";

/**
 * CTA final — "statement géant" dark éditorial (identité propre) :
 *   - Carte plein cadre marron, image en fond + halo chaud
 *   - Titre serif SURDIMENSIONNÉ
 *   - Layout asymétrique : énoncé à gauche, actions ancrées en bas à droite
 */
export default function CtaBannerSection() {
  return (
    <MotionSection as="section" className="px-6 py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-secondary shadow-2xl">
        {/* Image de fond */}
        <Image
          src="/images/photos/immeuble.jpeg"
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-center opacity-25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-secondary/60"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative grid grid-cols-1 gap-10 px-8 py-16 sm:px-14 sm:py-20 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:px-20 lg:py-24">
          {/* Énoncé */}
          <div>
            <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="h-px w-8 bg-primary/60" />
              Un projet immobilier ?
            </span>
            <h2 className="mt-6 font-agate text-4xl font-bold leading-[1.0] tracking-tight text-white sm:text-5xl lg:text-[4rem]">
              Confiez-le à{" "}
              <span className="italic text-primary">Agence Mirna</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              Vente, location, gestion, estimation : un expert vous répond sous
              24h ouvrées pour donner vie à votre projet.
            </p>
          </div>

          {/* Actions ancrées */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <Link
              href="/estimation"
              className={cn(
                buttonVariants(),
                "h-14 justify-between gap-3 px-7 text-base shadow-xl",
              )}
            >
              Estimation gratuite
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact_us"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-14 justify-between gap-3 border-white/40 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white hover:text-secondary",
              )}
            >
              Nous contacter
              <Phone className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
