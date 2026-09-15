import { ServicePageLayout } from "../_components/service-page";
import {  PieChart, Shield,  MapPin, Sparkles, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: "Promotion immobilière et programmes neufs : Agence Mirna",
  description: "Développement de projets immobiliers résidentiels et commerciaux à Abidjan : emplacements de choix, architecture moderne et normes environnementales.",
};

export default function PromotionImmobilierePage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200"
      slug="promotion-immobiliere"
      name="Promotion Immobilière"
      icon="Building2"
      shortDescription="Développement et commercialisation de programmes immobiliers neufs de très haut standing à Abidjan."
      cta={{ label: "Découvrir les programmes en cours", href: "/contact_us" }}
    >
      {/* SECTION 1: VISION ET VALEURS */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Cercles de déco */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full border border-primary/20 pointer-events-none"></div>
        <div className="absolute top-10 right-10 -mr-20 -mt-20 w-64 h-64 rounded-full border border-primary/10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="font-agate text-4xl sm:text-5xl md:text-6xl font-bold text-secondary mb-6 leading-tight">
              Des lieux de vie d&apos;exception, <br/><span className="text-primary">des investissements pérennes.</span>
            </h2>
            <p className="text-xl text-neutral-600">
              L&apos;Agence Mirna se positionne comme un créateur d&apos;espaces de vie. Nous identifions les meilleurs fonciers d&apos;Abidjan pour y ériger des résidences sécurisées, intelligentes et respectueuses de l&apos;environnement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-[#FAF5EE] flex items-center justify-center text-primary mb-6">
                <MapPin className="h-10 w-10" />
              </div>
              <h3 className="font-agate text-2xl font-bold text-secondary mb-3">Emplacements Premium</h3>
              <p className="text-neutral-600">Nous sélectionnons minutieusement nos terrains dans les zones à forte croissance et les quartiers les plus prisés (Cocody, Zone 4, Marcory).</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-[#FAF5EE] flex items-center justify-center text-primary mb-6">
                <Sparkles className="h-10 w-10" />
              </div>
              <h3 className="font-agate text-2xl font-bold text-secondary mb-3">Architecture & Design</h3>
              <p className="text-neutral-600">Nos résidences se démarquent par une architecture contemporaine audacieuse, des volumes généreux et des prestations très haut de gamme.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-[#FAF5EE] flex items-center justify-center text-primary mb-6">
                <PieChart className="h-10 w-10" />
              </div>
              <h3 className="font-agate text-2xl font-bold text-secondary mb-3">Rentabilité Locative</h3>
              <p className="text-neutral-600">Investir dans le neuf avec Mirna, c&apos;est s&apos;assurer d&apos;un actif rare, très demandé en location meublée ou longue durée, générant d&apos;excellents rendements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VEFA & SECURITE */}
      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-secondary rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest w-fit mb-6">
                <Shield className="h-4 w-4" /> VEFA
              </div>
              <h2 className="font-agate text-4xl sm:text-5xl font-bold mb-6">
                Acheter sur plan en toute sécurité
              </h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Nos ventes s&apos;effectuent sous le régime de la Vente en l&apos;État Futur d&apos;Achèvement (VEFA). Les paiements sont échelonnés en fonction de l&apos;avancement réel des travaux, certifié par un architecte indépendant.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium text-white/90">Garantie Financière d&apos;Achèvement (GFA)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium text-white/90">Paiements sécurisés via compte séquestre notarié</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium text-white/90">Garantie décennale et biennale</span>
                </li>
              </ul>
              <Button asChild className="w-fit bg-primary text-white hover:bg-primary/90 rounded-full h-12 px-8">
                <Link href="/contact_us">Contacter un conseiller expert</Link>
              </Button>
            </div>
            <div className="w-full md:w-1/2 relative min-h-[400px]">
              <Image src="https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=800" alt="Maquette d'architecte" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
      
      {/* ESPACE VISUEL */}
      <div className="h-24 bg-white"></div>
    </ServicePageLayout>
  );
}
