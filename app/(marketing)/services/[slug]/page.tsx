import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceBySlug, getActiveServices } from "@/src/actions/public";
import { ServiceIcon } from "../service-icon";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service introuvable" };
  return {
    title: `${service.name} — Agence Mirna`,
    description: service.short_description ?? undefined,
  };
}

export default async function ServiceDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const allServices = await getActiveServices();
  const otherServices = allServices
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  return (
    <main className="relative isolate">
      {/* Hero */}
      <section className="bg-primary/5 pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Tous nos services
          </Link>

          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ServiceIcon name={service.icon} className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-agate font-bold tracking-tight">
                {service.name}
              </h1>
              {service.short_description && (
                <p className="mt-3 text-base sm:text-lg text-neutral-700">
                  {service.short_description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Corps */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Description longue */}
            <div className="lg:col-span-2 space-y-6">
              {service.image && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-md bg-stone-100">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 67vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {service.long_description && (
                <div className="prose prose-neutral max-w-none">
                  <p className="text-base text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {service.long_description}
                  </p>
                </div>
              )}
            </div>

            {/* Aside : highlights + CTA */}
            <aside className="space-y-6">
              {service.highlights.length > 0 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                    Ce qui est inclus
                  </h2>
                  <ul className="space-y-3">
                    {service.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="text-neutral-700">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.cta_url && (
                <div className="rounded-2xl bg-secondary text-white p-6">
                  <h2 className="text-lg font-semibold mb-1">
                    Intéressé ?
                  </h2>
                  <p className="text-sm text-white/80 mb-4">
                    Échangeons sur votre projet — réponse sous 24h.
                  </p>
                  <Button asChild className="w-full">
                    <Link href={service.cta_url}>
                      {service.cta_label ?? "Nous contacter"}
                    </Link>
                  </Button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Autres services */}
      {otherServices.length > 0 && (
        <section className="bg-primary/5 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-agate font-bold mb-8 text-center">
              Nos autres services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group flex items-center gap-4 rounded-xl bg-white border border-stone-200 p-5 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ServiceIcon name={s.icon} className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {s.name}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                      {s.short_description ?? ""}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
