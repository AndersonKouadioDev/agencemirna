import Image from "next/image";
import Motion from "./motion";
import { Building2, Mail, Phone } from "lucide-react";

export default function AdresseSection() {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <Motion variant="verticalSlideIn">
          <h2 className="text-2xl text-center mx-auto max-w-2xl sm:text-3xl font-agate md:text-5xl font-bold">
            Votre Destination Immobilière au Cœur d&apos;Abidjan
          </h2>
        </Motion>
        <div className="flex mt-16 flex-col lg:flex-row max-w-screen-lg mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="lg:w-3/5 bg-primary/10 relative">
            <Motion variant="verticalSlideIn" animationParams={{ delay: 0.1 }}>
              <Image
                src="/images/biens/bien7.jpg"
                alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                className="object-cover object-bottom w-full h-full flex-grow"
                fill
              />
            </Motion>
          </div>

          <div className="lg:w-2/5 p-6">
            <Motion>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                Abidjan, Côte d&apos;Ivoire
              </h2>
              <p className="text-gray-600 md:text-lg mb-4">
                L&apos;Agence Mirna vous accueille dans ses locaux modernes et
                confortables, idéalement situés pour répondre à tous vos besoins
                immobiliers.
              </p>
              <p className="text-gray-800 text-sm md:text-base mb-4">
                Horraire : Lundi - Vendredi : 8h00 - 18h00
              </p>
              <div className="my-6 w-full h-px bg-gray-500 rounded-full"></div>
              <div className="space-y-4 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 flex-shrink-0 text-primary" />
                  <span>
                    2ème étage de l&apos;immeuble Zorôgbê, Rue du 7 décembre
                    <br />
                    Marcory Zone 4, Abidjan Côte d&apos;Ivoire
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-5 flex-shrink-0 text-primary" />
                  <span>info@agencemirna.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-5 flex-shrink-0 text-primary" />
                  <span>(+225) 01 43 483 131 / (+225) 27 21 536 231</span>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </div>
    </section>
  );
}
