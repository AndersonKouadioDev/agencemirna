import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { MotionSection } from "./motion-section";

/**
 * Bandeau CTA final (inspiré du bloc "Planning a Construction Project?") :
 *   - Fond marron foncé (secondary) + image immobilière en overlay
 *   - Titre fort + 2 CTA (Estimation gratuite / Nous appeler)
 *
 * Placé en fin de home, juste avant les sections de réassurance/contact.
 */
export default function CtaBannerSection() {
  return (
    <MotionSection as="section" className="px-6 py-16 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-secondary shadow-2xl">
        {/* Image de fond */}
        <Image
          src="/images/photos/immeuble.jpeg"
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-center opacity-30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/50"
        />
        {/* Halo décoratif */}
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative px-8 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Un projet immobilier ?
            </p>
            <h2 className="font-agate text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Confiez-le à Agence Mirna,
              <br className="hidden sm:block" /> on s&apos;occupe du reste
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
              Vente, location, gestion, estimation : un expert vous répond
              sous 24h ouvrées pour donner vie à votre projet.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/estimation"
                className={cn(buttonVariants(), "h-12 px-7 text-base shadow-xl")}
              >
                Estimation gratuite
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact_us"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 px-7 text-base border-white/50 bg-white/5 text-white backdrop-blur hover:bg-white hover:text-secondary",
                )}
              >
                <Phone className="mr-2 h-4 w-4" />
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
