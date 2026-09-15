import { ServicePageLayout } from "../_components/service-page";
import {  PenTool, FileCheck2, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: "Construction & Maîtrise d'œuvre à Abidjan : Agence Mirna",
  description: "De la conception à la remise des clés : expertise technique, suivi de chantier et respect des délais pour vos projets de construction à Abidjan.",
};

export default function ConstructionPage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200"
      slug="construction"
      name="Maîtrise d'Œuvre"
      icon="HardHat"
      shortDescription="Conception, pilotage et livraison de vos projets de construction, clés en main."
      cta={{ label: "Parler à un ingénieur", href: "/contact_us" }}
    >
      {/* SECTION 1: INTRO & EXPERTISE */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
                Construction & Rénovation
              </div>
              <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
                Construire l&apos;avenir avec <span className="text-primary">rigueur et passion.</span>
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                Que ce soit pour construire la villa de vos rêves, concevoir un immeuble de rapport ou rénover entièrement une bâtisse ancienne, la division technique de l&apos;Agence Mirna est votre partenaire de confiance.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Notre Bureau d&apos;Études intégré pilote chaque étape : des premières esquisses 3D à l&apos;obtention du Permis de Construire, jusqu&apos;au suivi rigoureux du chantier et la réception des travaux.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-secondary text-white hover:bg-secondary/90 rounded-full h-14 px-8">
                  <Link href="/contact_us">Obtenir un devis estimatif</Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1541888086925-920a05a401eb?auto=format&fit=crop&q=80&w=600" alt="Chantier moderne" fill className="object-cover" />
                </div>
                <div className="bg-[#FAF5EE] p-6 rounded-2xl text-center">
                  <div className="font-agate text-3xl font-bold text-primary mb-1">Gros Œuvre</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-primary text-white p-6 rounded-2xl text-center">
                  <div className="font-agate text-3xl font-bold mb-1">Second Œuvre</div>
                </div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=600" alt="Plans d'architecte" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LES 4 PILIERS */}
      <section className="py-24 bg-secondary text-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-agate text-4xl sm:text-5xl font-bold mb-6">
              Nos Engagements Chantier
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <PenTool className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Conception Sur-Mesure</h3>
              <p className="text-white/70 text-sm">Plans architecturaux adaptés à la topographie de votre terrain et modélisation 3D photoréaliste.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <FileCheck2 className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Normes & Légal</h3>
              <p className="text-white/70 text-sm">Assistance administrative, dépôt de PC, et respect strict des normes parasismiques et de construction.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <Clock className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Respect des Délais</h3>
              <p className="text-white/70 text-sm">Un planning prévisionnel détaillé et un reporting hebdomadaire pour vous tenir informé en temps réel.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <CheckCircle2 className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Qualité Garantie</h3>
              <p className="text-white/70 text-sm">Matériaux certifiés, finition soignée et garanties biennale et décennale sur tous nos ouvrages.</p>
            </div>
          </div>
        </div>
      </section>
    </ServicePageLayout>
  );
}
