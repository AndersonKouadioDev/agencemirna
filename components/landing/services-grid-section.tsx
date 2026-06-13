import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getActiveServices } from "@/src/actions/public";
import { ServiceIcon } from "@/app/(marketing)/services/service-icon";
import {
  MotionSection,
  MotionStagger,
  MotionStaggerChild,
} from "./motion-section";

/**
 * Section "Nos services" sur la home, façon landing premium :
 *   - Fond marron foncé (secondary) pour trancher avec les sections cream
 *   - Grille des services métier (depuis Supabase via getActiveServices)
 *   - Chaque carte : icône (résolue depuis le nom string), titre, description
 *     courte, lien vers /services/{slug}
 *
 * Si la table services est vide → la section ne se rend pas (return null).
 */
export default async function ServicesGridSection() {
  const services = await getActiveServices();
  if (services.length === 0) return null;

  return (
    <MotionSection as="section" className="bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Nos expertises
            </p>
            <h2 className="font-agate text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Un accompagnement complet,
              <br className="hidden sm:block" /> de A à Z
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
          >
            Tous nos services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grille services */}
        <MotionStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <MotionStaggerChild key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
              >
                {/* Icône */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-secondary">
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </div>

                <h3 className="font-agate text-xl font-bold leading-snug text-white">
                  {service.name}
                </h3>
                {service.short_description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">
                    {service.short_description}
                  </p>
                )}

                {/* Flèche coin */}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Découvrir
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </MotionStaggerChild>
          ))}
        </MotionStagger>
      </div>
    </MotionSection>
  );
}
