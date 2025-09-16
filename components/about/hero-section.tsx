import Image from "next/image";
import Motion from "../motion";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden isolate pt-52 pb-20 mx-auto max-w-screen-2xl"
    >
      <div className="container relative z-10">
        <div className="max-w-md md:max-w-screen-sm mx-auto text-center">
          <Motion variant="verticalSlideIn">
            <h1 className="text-3xl sm:text-4xl text-white font-agate md:text-6xl font-bold">
              A propos de notre <br />
              <span>agence immobilière</span>
            </h1>
          </Motion>

          <Motion animationParams={{ delay: 0.4 }}>
            <p className="text-sm md:text-lg text-white mt-2">
              Votre partenaire immobilier de confiance. À votre service depuis
              2022.
            </p>
          </Motion>
        </div>
        <div className="grid gap-4 md:gap-8 grid-cols-[.71fr_minmax(0,1fr)] max-h-[500px] justify-start mt-8 md:mt-16">
          <Motion
            variant="verticalSlideIn"
            animationParams={{ delay: 0.3 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="rounded-3xl max-w-[514px] overflow-hidden">
              <Image
                src="/images/biens/bien11.jpg"
                alt="Real Estate Firm Image - Houz X Webflow Template"
                className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                width={514}
                height={514}
              />
            </div>
          </Motion>
          <Motion
            variant="verticalSlideIn"
            viewport={{ once: true, amount: 0.2 }}
            animationParams={{ delay: 0.3 }}
          >
            <div className="rounded-bl-3xl rounded-tl-3xl flex flex-col justify-center items-center w-[60dvw] max-h-[696px] overflow-hidden">
              <Image
                src="/images/biens/bien12.jpg"
                alt="About Our Real Estate Firm Image - Houz X Webflow Template"
                className="object-cover w-full h-full hover:scale-105 transition-all duration-300"
                width={514}
                height={514}
              />
            </div>
          </Motion>
        </div>
      </div>
      <div className="w-full h-2/3 absolute top-0 left-0 right-0 bg-secondary "></div>
    </section>
  );
}
