import { formatNumber } from "@/utils/formatNumber";
import PropertyCard from "../property-card";

export default function PropertySection({ biens }: { biens: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 container mx-auto">
      {biens.map((bien: any) => (
        <PropertyCard
          key={bien.id}
          id={bien.id}
          imageUrl={bien.image}
          altText={bien.name}
          localisation={bien.localisation}
          address={bien.address}
          title={`${bien.types_bien.name} ${bien.name}`}
          detail={`${bien.types_bien.name} ${
            bien.types_bien.id > 1 ? bien.chambre + bien.salon + " pièces" : ""
          } | ${bien.ville_commune}, ${bien.pays}`}
          bedrooms={bien.chambre}
          bathrooms={bien.salle_bains}
          capacity={bien.capacity}
          status={bien.services_bien.name}
          parkingSpaces={1}
          price={formatNumber(bien.prix) + " FCFA"}
          pricePerMonth={formatNumber(bien.prix_month) + " FCFA"}
        />
      ))}
    </div>
  );
}
