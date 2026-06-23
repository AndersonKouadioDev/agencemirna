import { formatNumber } from "@/utils/formatNumber";
import PropertyCard from "../property-card";

export default function PropertySection({ biens }: { biens: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 container mx-auto">
      {biens.map((bien: any) => {
        // Jointures et champs potentiellement null : on sécurise tout pour
        // éviter les crashs (ex. bien sans prix → null.toString()).
        const typeName = bien.types_bien?.name ?? "";
        const serviceName = bien.services_bien?.name ?? "";
        const pieces =
          (bien.types_bien?.id ?? 0) > 1
            ? `${(bien.chambre ?? 0) + (bien.salon ?? 0)} pièces`
            : "";

        return (
          <PropertyCard
            key={bien.id}
            id={bien.id}
            imageUrl={bien.image}
            altText={bien.name}
            localisation={bien.localisation}
            address={bien.address}
            title={`${typeName} ${bien.name ?? ""}`.trim()}
            detail={`${typeName} ${pieces} | ${bien.ville_commune ?? ""}, ${
              bien.pays ?? ""
            }`}
            bedrooms={bien.chambre}
            bathrooms={bien.salle_bains}
            capacity={bien.capacity}
            status={serviceName}
            parkingSpaces={1}
            price={bien.prix != null ? formatNumber(bien.prix) + " FCFA" : ""}
            pricePerMonth={
              bien.prix_month != null
                ? formatNumber(bien.prix_month) + " FCFA"
                : ""
            }
          />
        );
      })}
    </div>
  );
}
