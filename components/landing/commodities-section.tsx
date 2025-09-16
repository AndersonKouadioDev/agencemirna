import Image from "next/image";
import { buttonVariants } from "../ui/button";
import {
  Flower2Icon,
  PenToolIcon,
  ShirtIcon,
  TvIcon,
  UtensilsCrossedIcon,
  WavesIcon,
  WifiIcon,
  AirVentIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import Link from "next/link";
import Motion from "../motion";

export default function CommoditiesSection() {
  return (
    <section
      id="commodities"
      className="relative bg-secondary overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="mx-auto flex flex-col items-center gap-8">
            <Motion>
              <div className="max-w-[500px] mx-auto text-center md:text-left px-4">
                <h2 className="text-3xl sm:text-4xl text-white font-agate md:text-5xl font-bold">
                  Plus d&apos;équipements
                </h2>
                <div className="mt-4">
                  <p className="text-sm md:text-lg text-white">
                    Chez Agence Mirna, nous croyons que votre expérience
                    immobilière doit être synonyme de confort, de sécurité et de
                    luxe abordable. Nos commodités sont conçues pour enrichir
                    votre quotidien et vous offrir un cadre de vie exceptionnel
                    à Abidjan.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                    <Link
                      className={buttonVariants({
                        variant: "default",
                      })}
                      href="/properties"
                    >
                      Parcourir les propriétés
                    </Link>
                    <Link
                      className={buttonVariants({
                        variant: "outline",
                      })}
                      href="/contact_us"
                    >
                      Parler à un agent
                    </Link>
                  </div>
                </div>
              </div>
            </Motion>

            <div className="col-span-2 md:col-span-1 max-w-[600px] mx-auto">
              <Motion variant="verticalSlideIn">
                <div className="max-w-[500px] mx-auto">
                  <Image
                    src="/images/illustrations/deco-home.png"
                    alt="Plus d'équipements"
                    width={500}
                    height={500}
                    className="w-full h-auto"
                  />
                </div>
              </Motion>
            </div>
          </div>
          <div className="overflow-hidden grid grid-cols-3">
            {[
              {
                icon: AirVentIcon,
                text: "Climatisation",
                borders: ["right", "bottom"],
              },
              {
                icon: TvIcon,
                text: "Télévision",
                borders: ["right", "bottom"],
              },
              {
                icon: UtensilsCrossedIcon,
                text: "Lave-vaisselle",
                borders: ["bottom"],
              },
              {
                icon: ArrowUpDownIcon,
                text: "Ascenseur",
                borders: ["right", "bottom"],
              },
              {
                icon: Flower2Icon,
                text: "Jardin",
                borders: ["right", "bottom"],
              },
              { icon: WifiIcon, text: "Internet", borders: [, "bottom"] },
              { icon: WavesIcon, text: "Jacuzzi", borders: ["right"] },
              { icon: ShirtIcon, text: "Buanderie", borders: ["right"] },
              { icon: PenToolIcon, text: "Piscine", borders: [] },
            ].map((item, index) => (
              <Motion
                key={index}
                variant="verticalSlideIn"
                animationParams={{ delay: 0.1 * index }}
              >
                <div className="text-center flex flex-col items-center justify-center py-10 relative">
                  <div className="w-10 p-1 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-neutral-700" />
                  </div>
                  <div className="text-sm md:text-lg font-bold text-neutral-100">
                    {item.text}
                  </div>
                  {item.borders.includes("right") && (
                    <div className="absolute m-1 right-0 top-1/2 w-px h-full bg-gray-500 rounded-full transform -translate-y-1/2"></div>
                  )}
                  {item.borders.includes("bottom") && (
                    <div className="absolute m-1 bottom-0 left-1/2 w-full h-px bg-gray-500 rounded-full transform -translate-x-1/2"></div>
                  )}
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
