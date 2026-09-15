import { ServicePageLayout } from "../_components/service-page";
import {  Palette,  LayoutPanelTop, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: "Décoration d'intérieur & Aménagement à Abidjan : Agence Mirna",
  description: "Aménagement et décoration sur-mesure pour sublimer vos espaces : design personnalisé, mobilier de créateurs et optimisation de l'espace.",
};

export default function DecorationAmenagementPage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200"
      slug="decoration-amenagement"
      name="Décoration & Aménagement"
      icon="Paintbrush"
      shortDescription="Sublimez votre intérieur. Des espaces uniques conçus autour de vous, de vos goûts et de votre mode de vie."
      cta={{ label: "Parler de mon projet déco", href: "/contact_us" }}
    >
      {/* SECTION 1: APPROCHE CREATIVE */}
      <section className="py-24 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden mt-8">
                <Image src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600" alt="Détail décoration" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600" alt="Salon design" fill className="object-cover" />
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
                Révélez le <span className="text-primary">potentiel caché</span> de votre bien.
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                Qu&apos;il s&apos;agisse de redonner vie à une maison ancienne, d&apos;aménager un appartement neuf sur plan ou de concevoir l&apos;univers de votre boutique ou bureau, notre studio de création imagine des intérieurs qui vous ressemblent.
              </p>
              
              <div className="space-y-8 mt-10">
                <div className="flex gap-5">
                  <div className="h-12 w-12 rounded-full bg-[#FAF5EE] flex items-center justify-center shrink-0">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-secondary mb-2">Identité Visuelle</h4>
                    <p className="text-neutral-600 text-sm">Planches tendances, nuanciers de couleurs, choix des matériaux nobles (marbre, bois, laiton) pour une harmonie parfaite.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="h-12 w-12 rounded-full bg-[#FAF5EE] flex items-center justify-center shrink-0">
                    <LayoutPanelTop className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-secondary mb-2">Agencement & Volumes</h4>
                    <p className="text-neutral-600 text-sm">Redistribution des pièces, optimisation de la circulation, conception de meubles sur-mesure (dressing, bibliothèque).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRESTATIONS (CARDS) */}
      <section className="py-24 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
              Nos formules d&apos;accompagnement
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 flex flex-col">
              <h3 className="font-agate text-3xl font-bold text-primary mb-4">Design Concept</h3>
              <p className="text-neutral-600 mb-8 flex-1">
                L&apos;étude créative de votre projet pour vous permettre de réaliser les travaux vous-même.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Cahier des charges</li>
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Plans d&apos;aménagement 2D</li>
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Vues 3D Photoréalistes</li>
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Shopping list complète</li>
              </ul>
            </div>
            
            <div className="bg-secondary p-10 rounded-3xl shadow-xl flex flex-col relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-primary text-white text-xs font-bold uppercase tracking-wide py-1 px-3 rounded-full">Recommandé</div>
              </div>
              <h3 className="font-agate text-3xl font-bold text-white mb-4">Projet Clé en Main</h3>
              <p className="text-white/80 mb-8 flex-1">
                De la création à la pose du dernier coussin, nous gérons l&apos;intégralité de votre projet.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white"><CheckCircle className="h-4 w-4 text-primary" /> Tout le pack Design Concept</li>
                <li className="flex items-center gap-2 text-sm text-white"><CheckCircle className="h-4 w-4 text-primary" /> Achat et stockage du mobilier</li>
                <li className="flex items-center gap-2 text-sm text-white"><CheckCircle className="h-4 w-4 text-primary" /> Suivi de chantier et artisans</li>
                <li className="flex items-center gap-2 text-sm text-white"><CheckCircle className="h-4 w-4 text-primary" /> Mise en scène finale</li>
              </ul>
              <Button asChild className="w-full bg-primary text-white hover:bg-primary/90 rounded-full h-12">
                <Link href="/contact_us">Demander un devis</Link>
              </Button>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 flex flex-col">
              <h3 className="font-agate text-3xl font-bold text-primary mb-4">Home Staging</h3>
              <p className="text-neutral-600 mb-8 flex-1">
                Rafraîchissement stratégique de votre bien pour déclencher un coup de cœur lors de la vente.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Désencombrement</li>
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Mise en peinture neutre</li>
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Prêt de mobilier déco</li>
                <li className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle className="h-4 w-4 text-primary" /> Shooting photo pro</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </ServicePageLayout>
  );
}
