import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getActiveServices } from "@/src/actions/public";
import { ServiceIcon } from "@/app/(marketing)/services/service-icon";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Section "Nos services" — version claire & éditoriale (fond blanc).
 *
 * Layout 2 colonnes :
 *   - Gauche : intro (eyebrow, titre, texte) + illustration + CTA
 *   - Droite : grille des services (depuis Supabase)
 *
 * Chaque carte : tuile d'icône dégradée (ou image du service si renseignée
 * en admin via le champ `image`), nom, description courte, lien.
 * Décor : blobs flous tintés (orange / marron) pour habiller le blanc.
 *
 * Si la table services est vide → la section ne se rend pas (return null).
 */
export default async function ServicesGridSection() {
  const services = await getActiveServices();
  if (services.length === 0) return null;

  return (
    <MotionSection
      as="section"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-28"
    >
      {/* Décor de fond : blobs flous */}
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-32 h-96 w-96 rounded-full bg-secondary/5 blur-3xl"
      />

      {/* Motifs décoratifs : pointillés + anneaux (cachés sur mobile) */}
      <div
        aria-hidden="true"
        className="absolute right-10 top-24 hidden h-28 w-44 lg:block"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--primary)) 1.6px, transparent 1.6px)",
          backgroundSize: "18px 18px",
          opacity: 0.22,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-20 left-[44%] hidden h-24 w-28 lg:block"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--secondary)) 1.6px, transparent 1.6px)",
          backgroundSize: "18px 18px",
          opacity: 0.16,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-12 top-1/3 hidden h-44 w-44 rounded-full border border-primary/20 lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute right-2 top-1/3 hidden h-24 w-24 translate-y-10 rounded-full border border-secondary/10 lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* Colonne gauche : intro + illustration */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Nos expertises
            </p>
            <h2 className="font-agate text-3xl font-bold leading-tight text-secondary text-balance sm:text-4xl md:text-5xl">
              Un accompagnement complet, de A à Z
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-600">
              De la recherche du bien à la gestion locative, en passant par la
              construction et la décoration : nos experts couvrent tout votre
              projet immobilier à Abidjan.
            </p>

            {/* Illustration */}
            <div className="relative mt-8 aspect-[4/3] w-full max-w-md">
              <Image
                src="/images/illustrations/service3.svg"
                alt="Illustration des services Agence Mirna"
                fill
                unoptimized
                className="object-contain object-left"
              />
            </div>

            <div className="mt-8">
              <Link
                href="/services"
                className={cn(buttonVariants(), "h-12 px-6 text-base")}
              >
                Tous nos services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Colonne droite : grille de services */}
          <MotionStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <MotionStaggerChild key={service.id}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {/* Visuel : image du service si dispo, sinon tuile d'icône */}
                  {service.image ? (
                    <div className="mb-4 h-20 w-20 overflow-hidden rounded-xl bg-primary/5">
                      <Image
                        src={service.image}
                        alt={service.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        unoptimized={service.image.startsWith("http")}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-colors group-hover:from-primary group-hover:to-primary group-hover:text-white">
                      <ServiceIcon name={service.icon} className="h-6 w-6" />
                    </div>
                  )}

                  <h3 className="font-agate text-lg font-bold leading-snug text-secondary">
                    {service.name}
                  </h3>
                  {service.short_description && (
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-neutral-600">
                      {service.short_description}
                    </p>
                  )}

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Découvrir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </MotionStaggerChild>
            ))}
          </MotionStagger>
        </div>
      </div>
    </MotionSection>
  );
}
