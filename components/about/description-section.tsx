"use client";

import Image from "next/image";
import Motion from "../motion";

export default function DescriptionSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden isolate py-20 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] items-center gap-4 lg:gap-8 ">
          <div className="order-2 lg:order-1 grid grid-cols-[minmax(0,1fr)_1.43fr] justify-end items-stretch justify-items-end max-w-[730px] lg:max-w-full gap-4 lg:gap-8">
            <div className="col-span-1 self-stretch">
              <Motion variant="horizontalSlideIn">
                <div className="flex flex-col w-full lg:w-[38vw] max-h-[554px] lg:max-h-[400px] md:max-h-[300px] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/biens/bien2.jpg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-cover w-full h-full flex-grow"
                    width={500}
                    height={500}
                  />
                </div>
              </Motion>
            </div>
            <div className="col-span-1 self-stretch">
              <Motion variant="horizontalSlideIn">
                <div className="flex flex-col max-w-[406px] lg:max-w-full max-h-[554px] lg:max-h-[400px] md:max-h-[300px] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/biens/bien5.jpg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-cover object-right w-full h-full flex-grow"
                    width={500}
                    height={500}
                  />
                </div>
              </Motion>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:pl-16 mt-8 lg:mt-0">
            <Motion variant="verticalSlideIn">
              <div className="text-center lg:text-left max-w-[486px] lg:max-w-full mx-auto">
                <h2 className="text-4xl font-agate font-bold mb-4">
                  Notre mission
                </h2>
                <p className="text-lg">
                  Offrir des solutions immobilières personnalisées et innovantes
                  pour répondre aux besoins uniques de chaque client, tout en
                  contribuant au développement durable du marché immobilier
                  ivoirien.
                </p>
              </div>
            </Motion>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1fr] items-center gap-4 lg:gap-8 mt-20">
          <div className="lg:pr-16 mt-8 lg:mt-0">
            <Motion variant="verticalSlideIn">
              <div className="text-center lg:text-left max-w-[486px] lg:max-w-full mx-auto">
                <h2 className="text-4xl font-agate font-bold mb-4">
                  Notre vision
                </h2>
                <p className="text-lg">
                  Devenir l&apos;agence immobilière de référence en Côte
                  d&apos;Ivoire, reconnue pour son expertise, son
                  professionnalisme et son approche centrée sur le client, tout
                  en façonnant l&apos;avenir de l&apos;immobilier dans la
                  région.
                </p>
              </div>
            </Motion>
          </div>
          <div className=" grid grid-cols-[minmax(0,1fr)_1.43fr] justify-start items-stretch justify-items-start max-w-[730px] lg:max-w-full gap-4 lg:gap-8">
            <div className="col-span-1 self-stretch">
              <Motion variant="horizontalSlideIn">
                <div className="flex flex-col w-full lg:w-[38vw] max-h-[554px] lg:max-h-[400px] md:max-h-[300px] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/biens/bien16.jpg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-cover w-full h-full flex-grow"
                    width={500}
                    height={500}
                  />
                </div>
              </Motion>
            </div>
            <div className="col-span-1 self-stretch">
              <Motion variant="horizontalSlideIn">
                <div className="flex flex-col md:top-10 relative max-w-[406px] lg:max-w-full max-h-[554px] lg:max-h-[400px] md:max-h-[300px] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/biens/bien15.jpg"
                    alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                    className="object-cover w-full h-full flex-grow"
                    width={500}
                    height={500}
                  />
                </div>
              </Motion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
