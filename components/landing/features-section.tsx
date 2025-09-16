import Image from "next/image";
import Motion from "../motion";

export default function FeaturesSection() {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          <div className="self-stretch">
            <Motion>
              <div className="max-w-xl">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-agate md:text-6xl font-bold">
                    Bienvenue chez <br /> Agence Mirna
                  </h2>
                  <div className="mt-4">
                    <p className="text-sm md:text-lg">
                      Chez Agence Mirna, nous comprenons que chaque projet
                      immobilier est unique. C&apos;est pourquoi nous offrons
                      une gamme complète de services conçus pour répondre à tous
                      vos besoins, qu&apos;il s&apos;agisse de trouver votre
                      nouveau chez-vous, de gérer votre investissement ou de
                      vendre votre bien.
                    </p>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
          <div className="self-end">
            <Motion>
              <div className="relative group h-full rounded-3xl overflow-hidden">
                <Image
                  src="/images/biens/bien3.jpg"
                  alt="Espace de co-working spacieux"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  width={500}
                  height={500}
                />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-8 left-10">
                  <p className="text-xl font-agate md:text-2xl font-bold text-white">
                    Gestion Immobilière
                  </p>
                </div>
              </div>
            </Motion>
          </div>

          <div className="self-end">
            <Motion>
              <div className="relative group rounded-3xl overflow-hidden">
                <Image
                  src="/images/biens/bien6.jpg"
                  alt="Espace de co-working spacieux"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  width={500}
                  height={500}
                />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-8 left-10">
                  <p className="text-xl font-agate md:text-2xl font-bold text-white">
                    Vente de Biens Immobiliers
                  </p>
                </div>
              </div>
            </Motion>
          </div>
          <div className="self-center">
            <Motion>
              <div className="relative group h-full rounded-3xl overflow-hidden">
                <Image
                  src="/images/biens/bien13.jpg"
                  alt="Espace de co-working spacieux"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  width={500}
                  height={500}
                />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-8 left-10">
                  <p className="text-xl font-agate md:text-2xl font-bold text-white">
                    Décoration d&apos;Intérieur et Aménagement
                  </p>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </div>
    </section>
  );
}
