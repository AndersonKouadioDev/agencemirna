import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getActiveServices } from "@/src/actions/public";
import { ServiceIcon } from "./service-icon";

export const metadata = {
  title: "Nos services — Agence Mirna",
  description:
    "Vente, gestion immobilière, location meublée, décoration, construction, promotion : tous nos services à Abidjan.",
};

export default async function ServicesHubPage() {
  const services = await getActiveServices();

  return (
    <main className="relative isolate bg-primary/5">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-agate font-bold tracking-tight">
          Nos services
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
          De la vente à la gestion locative, de la décoration à la
          construction : Agence Mirna est votre partenaire immobilier complet
          à Abidjan.
        </p>
      </section>

      {/* Grille des services */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-32">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-neutral-600">
            Aucun service disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200 hover:border-primary/40 hover:shadow-lg transition-all"
              >
                {/* Image / Icon header */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <ServiceIcon
                        name={service.icon}
                        className="h-16 w-16 text-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 flex flex-col p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ServiceIcon
                      name={service.icon}
                      className="h-5 w-5 text-primary shrink-0"
                    />
                    <h2 className="text-xl font-semibold text-neutral-900 truncate">
                      {service.name}
                    </h2>
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-3 flex-1">
                    {service.short_description ?? ""}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
