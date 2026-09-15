import { ServicePageLayout } from "../_components/service-page";
import { Check, Shield, Search, TrendingUp, Key, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: "Gestion locative à Abidjan : Agence Mirna",
  description:
    "Confiez-nous la gestion de votre patrimoine immobilier : sélection des locataires, suivi comptable et garantie des loyers impayés.",
};

export default function GestionImmobilierePage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200"
      slug="gestion-immobiliere"
      name="Gestion Locative"
      icon="Building"
      shortDescription="Sécurisez vos revenus locatifs et libérez-vous des contraintes administratives."
      cta={{ label: "Nous confier un bien", href: "/contact_us" }}
    >
      {/* SECTION 1: PROBLEMATIQUE / SOLUTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6">
              L&apos;immobilier locatif <span className="text-primary">sans les soucis.</span>
            </h2>
            <p className="text-lg text-neutral-600">
              Gérer un bien immobilier demande du temps, de l&apos;énergie et une solide connaissance de la législation. Nous prenons le relais pour vous garantir tranquillité d&apos;esprit et rentabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Sélection Rigoureuse",
                desc: "Analyse approfondie de la solvabilité de chaque dossier candidat pour éviter les impayés.",
                icon: Search
              },
              {
                title: "Administration",
                desc: "Rédaction du bail, états des lieux sur tablette, quittancement et encaissement des loyers.",
                icon: FileText
              },
              {
                title: "Technique",
                desc: "Gestion des sinistres, coordination des artisans partenaires et suivi des petits travaux.",
                icon: Key
              },
              {
                title: "Comptabilité",
                desc: "Reversement mensuel rapide de vos loyers, reddition de comptes claire et préparation pour vos impôts.",
                icon: TrendingUp
              }
            ].map((item, i) => (
              <div key={i} className="bg-[#FAF5EE] p-8 rounded-3xl hover:bg-secondary hover:text-white transition-colors group">
                <item.icon className="h-10 w-10 text-primary mb-6 group-hover:text-white transition-colors" />
                <h3 className="text-xl font-bold mb-3 group-hover:text-white text-secondary">{item.title}</h3>
                <p className="text-neutral-600 group-hover:text-white/80 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: ENGAGEMENTS */}
      <section className="py-24 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
          <svg className="absolute left-full transform -translate-x-1/2 -translate-y-1/4" width="800" height="800" fill="none" viewBox="0 0 800 800">
            <circle cx="400" cy="400" r="400" fill="currentColor" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white mb-6">
                Garantie Mirna
              </div>
              <h2 className="font-agate text-4xl sm:text-5xl font-bold mb-8">
                Vos intérêts sont nos priorités.
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Garantie Loyers Impayés (GLI)</h4>
                    <p className="text-white/80">Optionnelle mais recommandée, notre assurance couvre vos loyers, les dégradations immobilières et les frais de contentieux.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Transparence Totale</h4>
                    <p className="text-white/80">Accédez à votre espace propriétaire en ligne 24h/24 pour consulter vos comptes-rendus de gestion, vos baux et l&apos;état des interventions techniques.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-10 border-t border-white/20">
                <p className="text-xl font-medium mb-6">Découvrez combien pourrait vous rapporter votre bien sans les contraintes de gestion.</p>
                <Button asChild className="bg-white text-secondary hover:bg-white/90 rounded-full px-8 h-12">
                  <Link href="/estimation">Obtenir une étude locative gratuite</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=800" alt="Dossiers et clés" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    </ServicePageLayout>
  );
}
