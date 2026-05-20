import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@heroui/react";
import { Button } from "@/components/ui/button";
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
    <main className="bg-[#FAF5EE]">
      {/* HERO ÉDITORIAL */}
      <section className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Décoration de fond subtile */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--primary)) 0, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)) 0, transparent 40%)",
          }}
        />

        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Six expertises pour votre projet
          </div>

          <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-secondary leading-[1.05]">
            Nos services
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            De la vente à la gestion locative, de la décoration à la
            construction — Agence Mirna est votre partenaire immobilier
            complet à Abidjan.
          </p>
        </div>
      </section>

      {/* GRILLE SERVICES */}
      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {services.length === 0 ? (
            <Card className="p-12 text-center text-neutral-600">
              Aucun service disponible pour le moment.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, i) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  featured={i === 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA BANDEAU */}
      <section className="relative isolate bg-secondary text-white py-20 sm:py-28 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Un projet immobilier en tête ?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Parlons-en. Réponse sous 24h, devis gratuit, accompagnement
            personnalisé.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/contact_us">
                Nous contacter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <Link
                href={process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================================================================

function ServiceCard({
  service,
  featured,
}: {
  service: Awaited<ReturnType<typeof getActiveServices>>[number];
  featured?: boolean;
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE] rounded-2xl"
    >
      <Card
        variant="default"
        className="overflow-hidden h-full bg-white border-stone-200 group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image / Illustration */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10">
              <ServiceIcon
                name={service.icon}
                className="h-20 w-20 text-primary"
              />
            </div>
          )}
          {/* Petit badge icône en overlay (toujours visible, ancre la lecture) */}
          <div className="absolute top-4 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-sm text-primary">
            <ServiceIcon name={service.icon} className="h-5 w-5" />
          </div>
        </div>

        <Card.Header className="pt-6 pb-2">
          <Card.Title className="font-agate text-2xl text-secondary leading-tight">
            {service.name}
          </Card.Title>
        </Card.Header>

        <Card.Content className="pb-4">
          <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
            {service.short_description ?? ""}
          </p>
        </Card.Content>

        <Card.Footer className="pt-2 pb-6">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
            Découvrir
            <ArrowRight className="h-4 w-4" />
          </span>
        </Card.Footer>
      </Card>
    </Link>
  );
}
