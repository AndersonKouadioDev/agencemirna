import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { Breadcrumbs, Card, Chip } from "@heroui/react";
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
    <main className="bg-[#FAF5EE]">
      {/* HERO IMMERSIF (image full-bleed si dispo, sinon dégradé) */}
      <section className="relative isolate overflow-hidden">
        {service.image ? (
          <>
            <div className="absolute inset-0 -z-10">
              <Image
                src={service.image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(45,31,15,0.85) 0%, rgba(45,31,15,0.65) 50%, rgba(212,145,68,0.55) 100%)",
                }}
              />
            </div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8 pt-36 pb-24 sm:pt-44 sm:pb-32 text-white">
              <Breadcrumbs className="mb-8 text-white/80 [&_a]:text-white/80 [&_a:hover]:text-white">
                <Breadcrumbs.Item href="/">Accueil</Breadcrumbs.Item>
                <Breadcrumbs.Item href="/services">Services</Breadcrumbs.Item>
                <Breadcrumbs.Item>{service.name}</Breadcrumbs.Item>
              </Breadcrumbs>

              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                  <ServiceIcon name={service.icon} className="h-3.5 w-3.5" />
                  Notre service
                </div>
                <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                  {service.name}
                </h1>
                {service.short_description && (
                  <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                    {service.short_description}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          // Fallback sans image : dégradé brand
          <div className="bg-gradient-to-br from-secondary via-secondary/90 to-primary text-white pt-36 pb-24 sm:pt-44 sm:pb-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <Breadcrumbs className="mb-8 text-white/80 [&_a]:text-white/80 [&_a:hover]:text-white">
                <Breadcrumbs.Item href="/">Accueil</Breadcrumbs.Item>
                <Breadcrumbs.Item href="/services">Services</Breadcrumbs.Item>
                <Breadcrumbs.Item>{service.name}</Breadcrumbs.Item>
              </Breadcrumbs>
              <div className="flex items-start gap-6">
                <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <ServiceIcon name={service.icon} className="h-10 w-10" />
                </div>
                <div className="max-w-3xl">
                  <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                    {service.name}
                  </h1>
                  {service.short_description && (
                    <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                      {service.short_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CORPS : description + aside */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Description longue */}
            <article className="lg:col-span-2">
              {service.long_description && (
                <div className="prose prose-lg prose-neutral max-w-none">
                  <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-wrap first-letter:font-agate first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-none">
                    {service.long_description}
                  </p>
                </div>
              )}

              {service.highlights.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-agate text-3xl sm:text-4xl font-bold text-secondary mb-6">
                    Ce qui est inclus
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-white border border-stone-200 p-4"
                      >
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white mt-0.5">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className="text-sm text-neutral-800 leading-relaxed">
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            {/* Aside CTA sticky */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card
                variant="default"
                className="bg-secondary text-white border-secondary overflow-hidden"
              >
                <Card.Header className="pt-6">
                  <Card.Title className="font-agate text-2xl text-white">
                    Prêt à démarrer ?
                  </Card.Title>
                  <Card.Description className="text-white/80">
                    Échangeons sur votre projet — réponse sous 24h, devis
                    gratuit et sans engagement.
                  </Card.Description>
                </Card.Header>
                <Card.Content className="space-y-3 pb-6">
                  {service.cta_url && (
                    <Button asChild className="w-full rounded-full">
                      <Link href={service.cta_url}>
                        {service.cta_label ?? "Nous contacter"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link
                      href={
                        process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Link>
                  </Button>
                </Card.Content>
              </Card>

              {/* Mini-engagement */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-stone-200 p-4 text-center">
                  <div className="font-agate text-3xl font-bold text-primary">
                    24h
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    Délai de réponse
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-stone-200 p-4 text-center">
                  <div className="font-agate text-3xl font-bold text-primary">
                    Gratuit
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    Devis et conseil
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* AUTRES SERVICES */}
      {otherServices.length > 0 && (
        <section className="bg-white py-20 sm:py-28 border-t border-stone-200">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Explorez aussi
              </p>
              <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary">
                Nos autres services
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-white rounded-xl"
                >
                  <Card
                    variant="transparent"
                    className="bg-[#FAF5EE] border-stone-200 group-hover:border-primary/40 group-hover:shadow-md transition-all h-full"
                  >
                    <Card.Content className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <ServiceIcon name={s.icon} className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                            {s.name}
                          </h3>
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                            {s.short_description ?? ""}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                            En savoir plus
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
