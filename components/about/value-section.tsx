import Image from "next/image";
import Motion from "../motion";

export default function ValueSection() {
  return (
    <section
      id="hero"
      className="relative bg-secondary overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <Motion variant="verticalSlideIn">
          <h2 className="text-2xl max-w-2xl text-white sm:text-3xl font-agate md:text-5xl font-bold">
            Nos services
          </h2>
        </Motion>
        <div className="mt-16 grid divide-x divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0 xl:grid-cols-4">
          <Motion variant="verticalSlideIn" animationParams={{ delay: 0.2 }}>
            <div className="group relative  transition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10">
              <div className="relative  space-y-8 py-12 p-8">
                <div className="relative max-w-full h-[150px]">
                  <Image
                    src="/images/illustrations/service4.svg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-contain w-full h-full"
                    fill
                  />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-medium text-white transition group-hover:text-primary">
                    Location meublée et non meublée.
                  </h5>
                  <p className="text-sm text-white">
                    Trouvez le logement parfait qui correspond à votre style de
                    vie. Que vous recherchiez un appartement moderne au cœur
                    d&apos;Abidjan ou une villa spacieuse pour votre famille,
                    notre portefeuille diversifié saura répondre à vos attentes.
                  </p>
                  <p>Horraire : Lundi - Vendredi : 8h00 - 18h00</p>
                </div>
              </div>
            </div>
          </Motion>
          <Motion variant="verticalSlideIn" animationParams={{ delay: 0.3 }}>
            <div className="group relative transition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10">
              <div className="relative space-y-8 py-12 p-8">
                <div className="relative max-w-full h-[150px]">
                  <Image
                    src="/images/illustrations/service1.svg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-contain w-full h-full"
                    fill
                  />
                </div>

                <div className="space-y-2">
                  <h5 className="text-xl font-medium text-white transition group-hover:text-primary">
                    Gestion locative
                  </h5>
                  <p className="text-sm text-gray-300">
                    Propriétaires, libérez-vous des contraintes de la gestion
                    quotidienne. Notre équipe expérimentée prend en charge tous
                    les aspects de la gestion locative, de la recherche de
                    locataires fiables à la maintenance de votre bien, en
                    passant par la collecte des loyers.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
          <Motion variant="verticalSlideIn" animationParams={{ delay: 0.4 }}>
            <div className="group relative ransition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10">
              <div className="relative space-y-8 py-12 p-8">
                <div className="relative max-w-full h-[150px]">
                  <Image
                    src="/images/illustrations/service2.svg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-contain w-full h-full"
                    fill
                  />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-medium text-white transition group-hover:text-primary">
                    Vente de biens immobiliers
                  </h5>
                  <p className="text-sm text-gray-300">
                    Que vous souhaitiez vendre ou acquérir un bien, notre
                    expertise du marché abidjanais vous assure une transaction
                    en toute sérénité. Nous vous guidons à chaque étape, de
                    l&apos;évaluation à la signature finale.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
          <Motion variant="verticalSlideIn" animationParams={{ delay: 0.5 }}>
            <div className="group relative transition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10">
              <div className="relative space-y-8 py-12 p-8">
                <div className="relative max-w-full h-[150px]">
                  <Image
                    src="/images/illustrations/service3.svg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-contain w-full h-full"
                    fill
                  />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-medium text-white transition group-hover:text-primary">
                    Décoration d&apos;intérieur et aménagement
                  </h5>
                  <p className="text-sm text-gray-300">
                    Transformez votre espace en un lieu qui vous ressemble. Nos
                    décorateurs talentueux vous aident à créer un intérieur qui
                    allie esthétique et fonctionnalité, reflétant parfaitement
                    votre personnalité et vos besoins.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
        </div>
      </div>
    </section>
  );
}
