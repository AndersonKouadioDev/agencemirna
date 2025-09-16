import Marquee from "@/components/magicui/marquee";
import Image from "next/image";
import Motion from "./motion";

export default function ClientSection() {
  return (
    <section
      id="clients"
      className="relative overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <Motion variant="verticalSlideIn">
            <h2 className="text-center md:text-xl font-semibold text-gray-600">
              Approuvé par plus de 100 clients et partenaires.
            </h2>
          </Motion>
          <Motion variant="verticalSlideIn">
            <div className="relative mt-6 w-full">
              <Marquee className="max-w-full [--duration:40s]">
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire1.jpeg"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire1.jpeg"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire2.jpeg"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire2.jpeg"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire3.png"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire3.png"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire4.jpg"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire4.jpg"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire5.jpg"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire5.jpg"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire6.png"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire6.png"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire7.png"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire7.png"}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="relative max-w-20 max-h-14 md:max-h-16 lg:max-h-20">
                  <Image
                    src={"/images/partenaires/partenaire8.svg"}
                    className="w-full h-full object-contain"
                    alt={"/images/partenaires/partenaire8.svg"}
                    width={100}
                    height={100}
                  />
                </div>
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/5 bg-gradient-to-r from-background"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/5 bg-gradient-to-l from-background"></div>
            </div>
          </Motion>
        </div>
      </div>
    </section>
  );
}
