import { getAllBiens } from "@/src/actions/bien.actions";
import PropertyCard from "@/components/property-card";
import { formatNumber } from "@/utils/formatNumber";

export default async function SimilarProperties({ currentBienId }: { currentBienId: string }) {
  const allBiens = await getAllBiens();
  
  // Filter out the current bien and take top 3
  const similarBiens = allBiens
    .filter((bien: any) => bien.id !== currentBienId)
    .slice(0, 3);

  if (similarBiens.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-agate font-bold text-secondary">
            Ces biens pourraient aussi vous intéresser
          </h2>
          <p className="text-stone-500 mt-2">Découvrez d'autres propriétés exclusives dans notre catalogue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {similarBiens.map((bien: any) => (
            <PropertyCard
              key={bien.id}
              id={bien.id}
              imageUrl={bien.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"}
              altText={bien.name || "Bien"}
              address={bien.ville_commune || "Abidjan"}
              title={bien.name || "Bien immobilier"}
              localisation={bien.lien_localisation}
              detail={bien.description || bien.short_description || "Magnifique bien"}
              capacity={bien.capacity}
              area={bien.area ? `${bien.area} m²` : undefined}
              bedrooms={bien.chambre}
              bathrooms={bien.salle_bains}
              parkingSpaces={bien.parking}
              status={bien.services_bien?.name || "Disponible"}
              price={bien.prix ? `${formatNumber(bien.prix)} FCFA` : ""}
              pricePerMonth={bien.prix_month ? `${formatNumber(bien.prix_month)} FCFA` : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
