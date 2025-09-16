import Motion from "../motion";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative bg-secondary overflow-hidden isolate pt-52 pb-20 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <div className="max-w-md md:max-w-screen-sm mx-auto text-center">
          <Motion variant="verticalSlideIn">
            <h1 className="text-3xl sm:text-4xl text-white font-agate md:text-6xl font-bold">
              Parcourir les propriétés
            </h1>
          </Motion>

          <Motion animationParams={{ delay: 0.4 }}>
            <p className="text-sm md:text-lg text-white mt-2">
            Agence Mirna vous propose une large sélection de biens à louer et à ventre de qualité. Notre service location et vente sont
            à votre service pour vous fournir toutes les informations sur les biens qui correspondent à vos besoins.
            </p>
          </Motion>
        </div>
      </div>
    </section>
  );
}
