import { ServicePageLayout } from "../_components/service-page";
import {   Briefcase, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: "Location meublée à Abidjan : Agence Mirna",
  description:
    "Appartements et villas meublés prêts à vivre, pour de courtes ou longues durées : biens équipés, conciergerie et flexibilité de durée.",
};

export default function LocationMeubleePage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200"
      slug="location-meublee"
      name="Location Meublée"
      icon="Sofa"
      shortDescription="Le confort d'un chez-soi avec les services de l'hôtellerie pour vos séjours à Abidjan."
      cta={{ label: "Voir nos biens", href: "/properties?service=Location+meubl%C3%A9e" }}
    >
      {/* SECTION 1: INTRODUCTION & STATS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/biens/bien11.jpg" 
                alt="Salon élégant meublé" 
                fill 
                className="object-cover"
              />
              <div className="absolute top-8 left-8 right-8 flex gap-4">
                <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-sm flex flex-col items-center flex-1">
                  <div className="font-agate text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-xs text-neutral-500 text-center font-medium">Clé en main</div>
                </div>
                <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-sm flex flex-col items-center flex-1">
                  <div className="font-agate text-3xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-xs text-neutral-500 text-center font-medium">Assistance</div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
                Court & Long Séjour
              </div>
              <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
                Posez vos valises, <span className="text-primary">nous gérons le reste.</span>
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                Que vous soyez en voyage d&apos;affaires pour quelques semaines, expatrié en cours d&apos;installation, ou en vacances prolongées, la location meublée Mirna est la solution idéale alliant flexibilité et standing.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Nos biens sont soigneusement sélectionnés dans les quartiers les plus sûrs et agréables d&apos;Abidjan (Cocody, Zone 4, Marcory Biétry...). Ils sont meublés et décorés par des professionnels pour vous offrir une expérience résidentielle chaleureuse et haut de gamme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: NOS GARANTIES (FEATURES) */}
      <section className="py-24 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
              Les standards de qualité Mirna
            </h2>
            <p className="text-lg text-neutral-600">
              Tous nos logements meublés répondent à une charte de qualité stricte pour garantir votre confort au quotidien.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-full bg-[#FAF5EE] flex items-center justify-center text-primary mb-6">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Prêt à vivre</h3>
              <p className="text-neutral-600 leading-relaxed">
                Mobilier complet, électroménager moderne, vaisselle de qualité, linge de lit et de toilette fournis à votre arrivée.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-full bg-[#FAF5EE] flex items-center justify-center text-primary mb-6">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Services inclus</h3>
              <p className="text-neutral-600 leading-relaxed">
                Connexion Internet Fibre Haut-Débit, abonnements TV (Canal+), eau, électricité et service de ménage régulier.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-full bg-[#FAF5EE] flex items-center justify-center text-primary mb-6">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Emplacements Prime</h3>
              <p className="text-neutral-600 leading-relaxed">
                Résidences sécurisées avec gardiennage 24/7, piscines et salles de sport dans les meilleurs quartiers de la capitale.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* SECTION 3: CTA BANDEAU IMAGE */}
      <section className="relative py-32 bg-secondary flex items-center justify-center text-center px-6 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1600" alt="Vue d'Abidjan" fill className="object-cover opacity-20" />
        <div className="relative z-10 max-w-3xl">
          <h2 className="font-agate text-4xl sm:text-5xl font-bold text-white mb-6">Trouvez votre cocon à Abidjan</h2>
          <p className="text-white/90 text-xl mb-10">Parcourez notre collection d&apos;appartements et villas meublés de prestige disponibles immédiatement.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-14">
              <Link href="/properties?service=Location+meubl%C3%A9e">Voir la sélection</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 rounded-full px-8 h-14">
              <Link href="/contact_us">Recherche sur-mesure</Link>
            </Button>
          </div>
        </div>
      </section>
    </ServicePageLayout>
  );
}
