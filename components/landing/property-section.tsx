import { buttonVariants } from "../ui/button";
import Link from "next/link";
import Motion from "../motion";
import PropertyCardStatic from "./property-card-static";

export default function PropertySection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <div className="mx-auto">
          <div className="mx-auto max-w-screen-md transform translate-y-0 scale-100 rotate-0 skew-0 opacity-100 transform-preserve-3d">
            <Motion variant="verticalSlideIn">
              <h2 className="text-3xl sm:text-4xl font-agate md:text-6xl font-bold text-center">
                Découvrez nos biens d&apos;exception
              </h2>
            </Motion>
          </div>
          <div className="mt-12 opacity-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <PropertyCardStatic
                id="1"
                imageUrl="/images/biens/bien1.jpg"
                altText="Appartement Dakar | 2 pièces"
                address="Marcory Zone 4, Rue Paul Langevin"
                title="Appartement Dakar | 2 pièces"
                bedrooms={1}
                bathrooms={2}
                capacity={2}
                status="À louer"
                price="70.0000 XOF"
                pricePerMonth="1.800.000 XOF"
              />
              <PropertyCardStatic
                id="2"
                imageUrl="/images/biens/bien6.jpg"
                altText="Appartement Kampala | 2 pièces"
                address="Marcory Zone 4, Rue du canal"
                title="Appartement Kampala | 2 pièces"
                bedrooms={1}
                bathrooms={2}
                capacity={2}
                status="À louer"
                price="70.0000 XOF"
                pricePerMonth="1.800.000 XOF"
              />
              <PropertyCardStatic
                id="3"
                imageUrl="/images/biens/bien10.jpg"
                altText="Appartement Nairobi | 2 pièces"
                address="Marcory Zone 4, Rue du 7 décembre"
                title="Appartement Nairobi | 2 pièces"
                bedrooms={1}
                bathrooms={2}
                capacity={2}
                status="À louer"
                price="70.0000 XOF"
                pricePerMonth="1.800.000 XOF"
              />
            </div>
          </div>
          <div className="mt-20">
            <div className="flex justify-center">
              <Motion variant="verticalSlideIn">
                <Link
                  className={buttonVariants({
                    variant: "default",
                  })}
                  href="/properties"
                >
                  Parcourir toutes les propriétés
                </Link>
              </Motion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
