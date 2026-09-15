import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATIC_SERVICES } from "@/src/data/services";
import { WHATSAPP_URL_PAR_DEFAUT } from "@/src/data/contact";
import { AnimatedServices } from "./_components/animated-services";

export const dynamic = "force-static";

export const metadata = {
  title: "Nos services : Agence Mirna",
  description: "Vente, gestion immobilière, location meublée, décoration, construction, promotion : tous nos services à Abidjan.",
};

export default function ServicesHubPage() {
  const services = STATIC_SERVICES;
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || WHATSAPP_URL_PAR_DEFAUT;

  return (
    <main className="bg-white">
      {/* HERO ÉDITORIAL MODERNE */}
      <section className="relative isolate overflow-hidden pt-40 sm:pt-48 pb-20 sm:pb-32 bg-[#FAF5EE]">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            L'Excellence Immobilière
          </div>

          <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-secondary leading-[1.05] mb-8">
            Façonnons votre <br/><span className="text-primary italic font-light">avenir immobilier.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            De la vente à la gestion locative, de la décoration à la
            construction : Agence Mirna déploie six pôles d'expertise pour répondre à toutes vos exigences à Abidjan.
          </p>
        </div>
      </section>

      {/* LISTE DES SERVICES (ZIGZAG ANIMÉ) */}
      <section className="py-24 sm:py-32 bg-white relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {services.length === 0 ? (
            <div className="p-12 text-center text-neutral-600 border border-stone-200 rounded-3xl">
              Aucun service disponible pour le moment.
            </div>
          ) : (
            <AnimatedServices services={services} />
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-32 bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0, transparent 50%)" }} />
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="font-agate text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Prêt à donner vie à votre projet ?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Rencontrons-nous pour échanger sur vos objectifs. Nos experts vous accompagnent à chaque étape avec rigueur et discrétion.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-10 h-14 bg-primary text-white hover:bg-primary/90 text-base">
              <Link href="/contact_us">
                Prendre rendez-vous
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-10 h-14 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-base"
            >
              <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Discuter sur WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
