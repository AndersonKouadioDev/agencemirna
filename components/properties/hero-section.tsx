import Image from "next/image";
import Motion from "../motion";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative bg-secondary overflow-hidden isolate pt-40 sm:pt-48 pb-32 sm:pb-36 mx-auto max-w-screen-2xl"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/biens/bien1.jpg"
          alt="Propriétés Agence Mirna"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-secondary/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-md md:max-w-screen-md mx-auto text-center">
          <Motion variant="verticalSlideIn">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#F5B324] mb-6 backdrop-blur-md border border-white/10">
              Notre Catalogue
            </span>
          </Motion>
          <Motion variant="verticalSlideIn" animationParams={{ delay: 0.1 }}>
            <h1 className="text-4xl sm:text-5xl text-white font-agate md:text-6xl font-bold tracking-tight">
              Parcourir nos propriétés <br/>
              <span className="italic font-light text-[#F5B324]">d'exception</span>
            </h1>
          </Motion>

          <Motion animationParams={{ delay: 0.4 }}>
            <p className="text-base md:text-lg text-white/80 mt-6 max-w-2xl mx-auto font-light leading-relaxed">
              L'Agence Mirna vous propose une large sélection de biens à la location et à la vente. 
              Nos experts sont à votre disposition pour vous guider vers la propriété qui correspond parfaitement à vos attentes.
            </p>
          </Motion>
        </div>
      </div>
    </section>
  );
}
