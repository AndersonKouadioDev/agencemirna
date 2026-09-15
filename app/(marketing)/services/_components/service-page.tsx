import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL_PAR_DEFAUT } from "@/src/data/contact";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";
import { ServiceIcon } from "../service-icon";
import { ReactNode } from "react";
import { STATIC_SERVICES } from "@/src/data/services";
import { Card } from "@heroui/react";

export type ServicePageLayoutProps = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  image?: string;
  cta?: { label: string; href: string };
  children: ReactNode;
};

export function ServicePageLayout({
  slug,
  name,
  shortDescription,
  icon,
  image,
  cta,
  children,
}: ServicePageLayoutProps) {
    
  const otherServices = STATIC_SERVICES.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <main className="bg-[#FAF5EE]">
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Services", url: "/services" },
          { name, url: `/services/${slug}` },
        ]}
      />

      {/* 1. HERO IMMERSIF */}
      <section className="relative isolate overflow-hidden">
        {image ? (
          <>
            <div className="absolute inset-0 -z-10">
              <Image
                src={image}
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
            <div className="mx-auto max-w-6xl px-6 lg:px-8 pt-44 sm:pt-52 pb-24 sm:pb-32 text-white">
              <div className="flex flex-wrap items-center gap-y-1 space-x-2 text-sm text-white/80 mb-8"><Link href="/">Accueil</Link><span>/</span><Link href="/services">Services</Link><span>/</span><span className="text-white">{name}</span></div>

              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                  <ServiceIcon name={icon} className="h-3.5 w-3.5" />
                  Notre expertise
                </div>
                <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                  {name}
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                  {shortDescription}
                </p>
                {cta && (
                  <div className="mt-8 flex gap-4">
                    <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white">
                      <Link href={cta.href}>{cta.label}</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <a
                        href={
                          process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                          WHATSAPP_URL_PAR_DEFAUT
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-secondary via-secondary/90 to-primary text-white pt-44 sm:pt-52 pb-24 sm:pb-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-y-1 space-x-2 text-sm text-white/80 mb-8"><Link href="/">Accueil</Link><span>/</span><Link href="/services">Services</Link><span>/</span><span className="text-white">{name}</span></div>

              <div className="flex items-start gap-6">
                <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <ServiceIcon name={icon} className="h-10 w-10" />
                </div>
                <div className="max-w-3xl">
                  <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                    {name}
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                    {shortDescription}
                  </p>
                  {cta && (
                    <div className="mt-8 flex gap-4">
                      <Button asChild size="lg" className="rounded-full bg-white text-secondary hover:bg-white/90">
                        <Link href={cta.href}>{cta.label}</Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      >
                        <a
                          href={
                            process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                            WHATSAPP_URL_PAR_DEFAUT
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* 2. UNIQUE CONTENT PER PAGE */}
      {children}
      
      {/* 8. AUTRES SERVICES */}
      {otherServices.length > 0 && (
        <section className="bg-white py-20 sm:py-28 border-t border-stone-200">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Explorez aussi
              </p>
              <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary">
                Nos autres expertises
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
