import Image from "next/image";
import { Sparkles } from "lucide-react";
import HeroSearchBar from "./hero-search-bar";

/**
 * Hero refondu : grande baseline + barre de recherche intégrée +
 * 2 photos cinéma + petits trust signals.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-x-clip bg-[#FAF5EE] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
    >
      {/* Décoration de fond */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Texte + recherche */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Votre partenaire immobilier depuis 2022
            </div>

            <h1 className="font-agate text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-secondary leading-[1.02]">
              Trouvez le bien <br className="hidden sm:block" />
              de vos <span className="text-primary italic">rêves</span>{" "}
              à Abidjan
            </h1>

            <p className="mt-6 text-lg text-neutral-700 max-w-xl leading-relaxed">
              Studios meublés, appartements, villas, terrains : explorez
              notre sélection ou laissez-nous trouver pour vous.
            </p>

            {/* Barre de recherche */}
            <div className="mt-8">
              <HeroSearchBar />
            </div>

            {/* Trust mini */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#FAF5EE] bg-gradient-to-br from-primary/40 to-secondary/40"
                    />
                  ))}
                </div>
                <span>
                  <strong className="text-neutral-900">100+</strong> clients
                  satisfaits
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500">★★★★★</span>
                <span>Confiance reconnue</span>
              </div>
            </div>
          </div>

          {/* Photos cinéma */}
          <div className="relative h-[500px] lg:h-[580px] hidden sm:block">
            {/* Photo principale */}
            <div className="absolute top-0 right-0 w-[68%] h-[60%] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/photos/agent-immob.png"
                alt="Agent immobilier Agence Mirna"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Photo secondaire qui chevauche */}
            <div className="absolute bottom-0 left-0 w-[68%] h-[60%] rounded-3xl overflow-hidden shadow-2xl ring-8 ring-[#FAF5EE]">
              <Image
                src="/images/biens/bien1.jpg"
                alt="Intérieur d'un appartement à Abidjan"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            {/* Mini card flottante */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-4 max-w-[180px] hidden lg:block">
              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">
                Dernier ajout
              </div>
              <div className="font-agate text-lg font-bold text-secondary leading-tight">
                Villa Cocody
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-primary font-semibold">250 000</span>
                <span className="text-xs text-neutral-500">FCFA/nuit</span>
              </div>
            </div>
          </div>

          {/* Photo mobile only */}
          <div className="sm:hidden relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/biens/bien1.jpg"
              alt="Intérieur d'un appartement à Abidjan"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
