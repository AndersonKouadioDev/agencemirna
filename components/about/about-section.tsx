import { CheckIcon } from "lucide-react";
import NumberTicker from "../magicui/number-ticker";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import Motion from "../motion";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container mx-auto px-4 max-w-screen-xl">
        {/* Section 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <Motion variant="verticalSlideIn">
            <div className="max-w-[520px]">
              <h2 className="text-3xl sm:text-4xl font-agate md:text-6xl font-bold mb-4">
                À propos de{" "}
                <span className="whitespace-nowrap">Agence Mirna</span>
              </h2>
              <p className="text-sm md:text-lg mb-4">
                Fondée en 2022 par Madame Barry Néné Yéro, l&apos;Agence Mirna
                s&apos;est rapidement imposée comme un acteur dynamique du
                marché immobilier à Abidjan, Côte d&apos;Ivoire. Située au cœur
                de Marcory Zone 4, dans l&apos;immeuble Zorôgbê, notre agence
                offre une gamme complète de services immobiliers pour répondre à
                tous vos besoins.
              </p>
              <p className="text-sm md:text-lg">
                Agréée par l&apos;État de Côte d&apos;Ivoire, l&apos;Agence
                Mirna est spécialisée dans la location meublée et non meublée,
                la gestion locative, la vente de biens immobiliers, ainsi que la
                décoration d&apos;intérieur et l&apos;aménagement. Notre
                expertise et notre engagement envers l&apos;excellence nous
                permettent d&apos;assurer à nos clients une expérience
                immobilière stable, confortable et sécurisée à Abidjan.
              </p>
            </div>
          </Motion>
          <Motion variant="horizontalSlideIn">
            <div className="relative justify-self-end rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/biens/bien15.jpg"
                alt="À propos de Houz X"
                className="object-cover w-full h-full flex-grow hover:scale-105 transition-all duration-300"
                width={500}
                height={500}
              />
            </div>
          </Motion>
        </div>

        {/* Section 2 */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center pb-32 max-w-7xl mx-auto">
          <div className="relative z-10 self-stretch order-2 md:order-1">
            <div className="flex flex-col items-end w-full md:max-w-[622px] md:mt-48">
              <Motion variant="horizontalSlideIn">
                <div className="relative md:w-[50vw] max-h-96 md:max-h-[692px] md:-ml-[50vw] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/others/Cart d'identité.png"
                    alt="Pourquoi acheter avec nous"
                    className="object-cover w-full h-full flex-grow hover:scale-105 transition-all duration-300"
                    width={500}
                    height={500}
                  />
                </div>
              </Motion>
            </div>
          </div>
          <div className="self-start order-1 md:order-2">
            <div className="relative flex flex-col justify-center items-center mb-8 md:mb-16 py-16 md:pt-[23%] md:pb-[23%] overflow-visible">
              <div className="z-10">
                <Motion>
                  <div className="max-w-[498px]">
                    <div className="max-w-[450px]">
                      <h2 className="text-3xl sm:text-4xl font-agate md:text-5xl font-bold mb-6">
                        <span className="break-all">Pourquoi Choisir</span>{" "}
                        <span className="whitespace-nowrap">
                          Agence Mirna ?
                        </span>
                      </h2>
                    </div>
                    <p className="text-sm md:text-lg mb-8">
                      Chez Agence Mirna, nous ne nous contentons pas de simples
                      transactions immobilières. Nous créons des expériences sur
                      mesure, adaptées à vos rêves et à vos objectifs. Faites
                      confiance à notre équipe passionnée pour vous accompagner
                      dans toutes les étapes de votre projet immobilier.
                    </p>
                    <div className="space-y-6">
                      {[
                        "Expertise locale : Une connaissance approfondie du marché immobilier d'Abidjan.",
                        "Service personnalisé : Des solutions sur mesure pour chaque client.",
                        "Professionnalisme : Une équipe dévouée et qualifiée à votre service.",
                        "Innovation : Des approches modernes pour répondre aux défis immobiliers actuels.",
                      ].map((text, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <CheckIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                          <p className="text-sm md:text-lg">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Motion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
