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
              Contactez-nous
            </h1>
          </Motion>

          <Motion animationParams={{ delay: 0.4 }}>
            <p className="text-sm md:text-lg text-white mt-2">
              Votre Destination Immobilière au Cœur d&apos;Abidjan.
            </p>
          </Motion>
        </div>
      </div>
    </section>
  );
}
