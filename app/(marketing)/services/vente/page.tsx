import { ServicePageLayout } from "../_components/service-page";
import { Check, TrendingUp, Camera,  Target, ShieldCheck, ArrowRight, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: "Vente de biens immobiliers à Abidjan : Agence Mirna",
  description:
    "Achat et vente de villas, terrains et appartements haut de gamme à Abidjan : estimation précise, visibilité maximale et accompagnement juridique.",
};

export default function VentePage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
      slug="vente"
      name="Vente de biens"
      icon="Key"
      shortDescription="Vendez au meilleur prix et dans les meilleurs délais grâce à notre expertise du marché immobilier ivoirien."
      cta={{ label: "Vendre mon bien", href: "/estimation" }}
    >
      {/* SECTION 1: INTRODUCTION & STATS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
                Une transaction <span className="text-primary">sécurisée</span> et au juste prix.
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                La vente d&apos;un bien immobilier est une étape importante qui requiert du temps, des connaissances juridiques et une parfaite maîtrise du marché local. À l&apos;Agence Mirna, nous transformons ce parcours complexe en une expérience sereine et rentable pour vous.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                De l&apos;estimation précise de votre villa à Cocody jusqu&apos;à la signature de l&apos;acte authentique chez le notaire, notre équipe dédiée prend en charge l&apos;intégralité du processus de vente.
              </p>
              
              <div className="mt-10 grid grid-cols-2 gap-8">
                <div>
                  <div className="font-agate text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-neutral-500 font-medium">Transactions réussies</div>
                </div>
                <div>
                  <div className="font-agate text-4xl font-bold text-primary mb-2">45 jrs</div>
                  <div className="text-sm text-neutral-500 font-medium">Délai de vente moyen</div>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" 
                alt="Agent Mirna présentant un bien" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-secondary">Objectif 100%</div>
                      <div className="text-sm text-neutral-500">Satisfaction client</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: NOTRE EXPERTISE (FEATURES) */}
      <section className="py-24 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
              Pourquoi nous confier votre bien ?
            </h2>
            <p className="text-lg text-neutral-600">
              Nous déployons des moyens exceptionnels pour mettre en valeur votre patrimoine et attirer les meilleurs acquéreurs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">Estimation de précision</h3>
              <p className="text-neutral-600 leading-relaxed">
                Loin des estimations algorithmiques, nos experts se déplacent pour analyser votre bien, ses prestations uniques et son environnement direct pour définir le prix de vente optimal.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">Marketing Premium</h3>
              <p className="text-neutral-600 leading-relaxed">
                Photographies HDR, visite virtuelle 360°, vidéo par drone et diffusion sponsorisée sur nos réseaux et portails partenaires pour une visibilité inégalée.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">Sécurité & Filtre</h3>
              <p className="text-neutral-600 leading-relaxed">
                Fini les visites inutiles. Nous vérifions systématiquement la capacité de financement de chaque candidat acquéreur avant d&apos;organiser une visite physique de votre bien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CE QUI EST INCLUS */}
      <section className="py-24 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-secondary rounded-3xl p-8 md:p-16 overflow-hidden relative">
            {/* Motif de fond */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
              <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.7,-18,97.2,-2.3C97.7,13.4,92.8,29.3,83.3,42.4C73.8,55.5,59.7,65.8,44.7,73.1C29.7,80.4,13.8,84.7,-1.8,87.6C-17.4,90.5,-32.8,92,-46.4,85.8C-60,79.6,-71.8,65.7,-80.6,50.2C-89.4,34.7,-95.2,17.6,-95.1,0.6C-95,-16.4,-89,-32.8,-79.8,-47.4C-70.6,-62,-58.2,-74.8,-43.8,-81.7C-29.4,-88.6,-13.1,-89.6,2.1,-93C17.3,-96.4,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
              </svg>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-agate text-4xl sm:text-5xl font-bold text-white mb-8">
                  Le mandat de vente exclusif Mirna
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  En nous confiant l&apos;exclusivité de la vente de votre bien, vous bénéficiez d&apos;un pack de services Premium entièrement pris en charge par l&apos;agence.
                </p>
                <div className="space-y-4">
                  {[
                    "Reportage photo par un professionnel",
                    "Certificat de conformité et diagnostics offerts",
                    "Home staging virtuel pour les biens vides",
                    "Compte-rendu de visite systématique sous 24h",
                    "Assistance d'un avocat pour l'avant-contrat"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-10">
                  <Button asChild className="bg-primary text-white hover:bg-primary/90 rounded-full h-14 px-8 text-base">
                    <Link href="/contact_us">En savoir plus sur le mandat</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block relative h-[500px] w-full rounded-2xl overflow-hidden">
                 <Image src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=800" alt="Intérieur luxueux" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: GALERIE OU ACHETEUR (CTA DOUBLE) */}
      <section className="py-24 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 flex flex-col justify-between items-start border border-stone-100 hover:shadow-lg transition-shadow">
              <div>
                <div className="h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center mb-6">
                  <Home className="h-5 w-5" />
                </div>
                <h3 className="font-agate text-3xl font-bold text-secondary mb-4">Vous cherchez à acheter ?</h3>
                <p className="text-neutral-600 mb-8">
                  Découvrez notre catalogue de villas, d&apos;appartements de standing et de terrains constructibles dans les meilleurs quartiers d&apos;Abidjan.
                </p>
              </div>
              <Link href="/properties?service=Vente" className="inline-flex items-center gap-2 font-bold text-secondary hover:text-primary transition-colors">
                Explorer les biens en vente <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="bg-primary rounded-3xl p-10 flex flex-col justify-between items-start text-white shadow-xl">
              <div>
                <div className="h-12 w-12 rounded-full bg-white/20 text-white flex items-center justify-center mb-6">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-agate text-3xl font-bold text-white mb-4">Vous souhaitez vendre ?</h3>
                <p className="text-white/90 mb-8">
                  Ne laissez pas votre bien perdre de sa valeur. Obtenez une estimation gratuite et confidentielle en 48 heures.
                </p>
              </div>
              <Button asChild className="bg-white text-secondary hover:bg-white/90 rounded-full h-12 px-6">
                <Link href="/estimation">Demander une estimation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </ServicePageLayout>
  );
}
