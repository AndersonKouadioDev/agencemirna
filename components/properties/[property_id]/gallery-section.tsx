import Motion from "@/components/motion";

import Image from "next/image";

export default function GallerySection({ bien }: { bien: any }) {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 isolate pt-32 pb-20 mx-auto max-w-screen-xl"
    >
      <div className="container relative w-full">
        <Motion variant="verticalSlideIn">
          <h2 className="text-2xl text-center mx-auto max-w-2xl sm:text-3xl font-agate md:text-5xl font-bold">
            Galerie de propriétés
          </h2>
        </Motion>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          <div className="self-stretch justify-self-stretch rounded-[var(--core--border-radius--br-size-5)] block relative overflow-hidden">
            <div className="w-full h-full inline-block max-w-full rounded-3xl  overflow-hidden ">
              <Image
                src="/images/biens/bien1.jpg"
                alt="Espace de co-working spacieux"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                width={500}
                height={500}
              />
            </div>
          </div>

          <div className="self-stretch">
            <div className="grid grid-cols-2 gap-5 items-start">
              <div className="self-stretch">
                <div className="w-full h-full inline-block max-w-full">
                  <div className="rounded-3xl relative overflow-hidden w-full h-full">
                    <Image
                      src="/images/biens/bien1.jpg"
                      alt="Espace de co-working spacieux"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
              </div>
              <div className="self-stretch">
                <div className="w-full h-full inline-block max-w-full text-[var(--components--links--text-color--text-dark)] underline transition-colors duration-300 bg-transparent">
                  <div className="rounded-3xl relative overflow-hidden w-full h-full">
                    <Image
                      src="/images/biens/bien1.jpg"
                      alt="Espace de co-working spacieux"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
              </div>
              <div className="self-stretch">
                <div className="w-full h-full inline-block max-w-full text-[var(--components--links--text-color--text-dark)] underline transition-colors duration-300 bg-transparent">
                  <div className="rounded-3xl relative overflow-hidden w-full h-full">
                    <Image
                      src="/images/biens/bien1.jpg"
                      alt="Espace de co-working spacieux"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
              </div>
              <div className="self-stretch">
                <div className="w-full h-full inline-block max-w-full text-[var(--components--links--text-color--text-dark)] underline transition-colors duration-300 bg-transparent">
                  <div className="rounded-3xl relative overflow-hidden w-full h-full">
                    <Image
                      src="/images/biens/bien1.jpg"
                      alt="Espace de co-working spacieux"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
