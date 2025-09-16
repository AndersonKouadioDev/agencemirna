import Image from "next/image";
import Motion from "../motion";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 overflow-hidden isolate pt-52 pb-20 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <div className="absolute top-0 right-[27%] z-[-1] max-w-[850px] opacity-100">
          <Image
            src="/images/illustrations/background-hero.png"
            alt="BG Shape V6 Image - Houz X Webflow Template"
            className="w-full h-full object-cover"
            width={850}
            height={850}
          />
        </div>
        <div className=" z-[1] flex flex-col gap-8 lg:flex-row justify-center lg:justify-between items-center">
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            <Motion variant="fadeIn" viewport={{ once: false, amount: 1 }}>
              <h1 className="text-4xl font-agate md:text-6xl font-bold text-center lg:text-left">
                Découvrez les meilleures propriétés à Abidjan
              </h1>
            </Motion>
          </div>
          <div className="self-start mx-auto lg:mx-0">
            <Motion variant="fadeIn" animationParams={{ delay: 0.4 }}>
              <div className="mx-auto max-w-lg md:text-lg lg:text-xl text-center lg:text-left">
                Votre partenaire immobilier de confiance.<br /> À votre service depuis
                2022.
              </div>
            </Motion>
          </div>
        </div>

        <div className="grid grid-cols-[0.98fr_1fr] gap-4 items-start mt-12 lg:mt-[-3%] lg:grid-cols-2 lg:gap-8">
          <Motion
            variant="horizontalSlideIn"
            animationParams={{ delay: 0.4, offset: -50 }}
          >
            <div className="col-span-1 opacity-100 w-full max-w-[560px] lg:mt-[90px] rounded-3xl overflow-hidden">
              <Image
                src="/images/photos/agent-immob.png"
                alt="Discover The Best Properties In LA Image - Houz X Webflow Template"
                className="object-cover w-full h-full hover:scale-105 transition-all duration-300"
                width={560}
                height={400}
              />
            </div>
          </Motion>
          <Motion
            variant="horizontalSlideIn"
            animationParams={{ delay: 0.4, offset: 50 }}
          >
            <div className="col-span-1 opacity-100 w-full max-w-[623px] justify-self-end rounded-3xl overflow-hidden">
              <Image
                src="/images/biens/bien1.jpg"
                alt="Best Properties In LA Image - Houz X Webflow Template"
                className="object-cover w-full h-full hover:scale-105 transition-all duration-300"
                width={623}
                height={400}
              />
            </div>
          </Motion>
        </div>
      </div>
    </section>
  );
}
