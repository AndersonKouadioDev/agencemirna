import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { STATIC_SERVICES } from "@/src/data/services";
import { ServiceIcon } from "@/app/(marketing)/services/service-icon";

/**
 * Les six métiers de l'agence, sur la page À propos.
 *
 * Alimentée par `STATIC_SERVICES`, la même source que les pages
 * /services/<slug> : une liste recopiée ici aurait divergé au premier
 * changement de libellé.
 */
export default function AboutServicesSection() {
  const services = [...STATIC_SERVICES].sort((a, b) => a.ordre - b.ordre);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
              Nos métiers <span>✦</span>
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Ce que nous faisons
            </h2>
            <p className="text-stone-600 mt-4 text-lg">
              De la recherche du bien à sa gestion quotidienne, six expertises
              qui couvrent tout le cycle de vie d&apos;un patrimoine immobilier
              à Abidjan.
            </p>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-primary transition-colors shrink-0"
          >
            Voir le détail de nos services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group relative flex flex-col gap-4 rounded-[24px] border border-stone-200 bg-[#FAF5EE] p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>

              <div className="flex-1">
                <h3 className="font-bold text-lg text-secondary leading-snug mb-2 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {service.short_description}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 group-hover:text-primary transition-colors">
                En savoir plus
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
