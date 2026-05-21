import { Calculator, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { EstimationForm } from "./estimation-form";

export const metadata = {
  title: "Estimation gratuite de votre bien : Agence Mirna",
  description:
    "Obtenez une estimation gratuite et argumentée de votre bien à Abidjan sous 24h ouvrées. Marché local, comparables, prix de vente ou de location.",
};

const REASONS = [
  {
    icon: Clock,
    title: "Réponse sous 24h",
    text: "Un expert vous rappelle pour valider les éléments puis vous envoie la fourchette de prix par email ou WhatsApp.",
  },
  {
    icon: ShieldCheck,
    title: "Sans engagement",
    text: "L'estimation est offerte et confidentielle. Aucune obligation de signer un mandat avec nous ensuite.",
  },
  {
    icon: Calculator,
    title: "Méthode rigoureuse",
    text: "Comparables récents du quartier, état du bien, tendance du marché. On argumente chaque chiffre.",
  },
];

export default function EstimationPage() {
  return (
    <main className="bg-[#FAF5EE]">
      {/* HERO */}
      <section className="relative isolate pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <Calculator className="h-3.5 w-3.5" />
            Estimation gratuite
          </div>
          <h1 className="font-agate text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-secondary leading-[1.1]">
            Combien vaut <span className="italic text-primary">vraiment</span>{" "}
            votre bien à Abidjan ?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            En 2 minutes, transmettez-nous les caractéristiques. Un expert
            vous rappelle sous 24h ouvrées avec une fourchette argumentée.
          </p>
        </div>
      </section>

      {/* CONTENU : form gauche + bénéfices droite */}
      <section className="pb-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-start">
            {/* Formulaire */}
            <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-10 shadow-sm">
              <EstimationForm />
            </div>

            {/* Bénéfices + témoignage */}
            <aside className="lg:sticky lg:top-32">
              <div className="space-y-6">
                {REASONS.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div key={r.title} className="flex items-start gap-4">
                      <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary text-sm sm:text-base">
                          {r.title}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed mt-0.5">
                          {r.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stat / preuve */}
              <div className="mt-10 rounded-2xl bg-secondary text-white p-6">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Vendre au juste prix
                </div>
                <p className="text-sm leading-relaxed text-white/85">
                  Un bien surestimé reste en moyenne 3 fois plus longtemps
                  sur le marché. Une estimation rigoureuse au démarrage
                  divise par 2 le temps de vente.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
