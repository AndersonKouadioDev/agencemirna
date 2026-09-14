import { formatNumber } from "@/utils/formatNumber";
import PropertyCard from "../property-card";

/**
 * Les lignes de `biens` n'ont pas de type généré : on déclare ici les seules
 * colonnes que cette grille lit réellement, plutôt que de laisser `any` masquer
 * une colonne fantôme jusqu'au rendu. Tout est nullable comme en base.
 */
type BienCarteSource = {
  id: string;
  image?: string | null;
  name?: string | null;
  localisation?: string | null;
  address?: string | null;
  ville_commune?: string | null;
  pays?: string | null;
  chambre?: number | null;
  salon?: number | null;
  salle_bains?: number | null;
  capacity?: number | null;
  prix?: number | null;
  prix_month?: number | null;
  types_bien?: { id?: number | null; name?: string | null } | null;
  services_bien?: { name?: string | null } | null;
  categories_bien?: { name?: string | null } | null;
};

export default function PropertySection({
  biens,
}: {
  biens: BienCarteSource[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 container mx-auto">
      {biens.map((bien) => {
        // Jointures et champs potentiellement null : on sécurise tout pour
        // éviter les crashs (ex. bien sans prix → null.toString()).
        const typeName = bien.types_bien?.name ?? "";
        const serviceName = bien.services_bien?.name ?? "";
        const categorie = (bien.categories_bien?.name ?? "").toLowerCase();
        // `undefined` et non `false` quand aucune catégorie n'est saisie :
        // PropertyCard doit pouvoir retomber sur le libellé du service dans ce
        // seul cas, sans qu'une catégorie absente ne soit lue comme « non meublé ».
        const furnished = categorie
          ? categorie.includes("meubl") && !categorie.includes("non meubl")
          : undefined;
        const pieces =
          (bien.types_bien?.id ?? 0) > 1
            ? `${(bien.chambre ?? 0) + (bien.salon ?? 0)} pièces`
            : "";

        return (
          <PropertyCard
            key={bien.id}
            id={bien.id}
            imageUrl={bien.image}
            altText={bien.name ?? ""}
            localisation={bien.localisation ?? undefined}
            address={bien.address ?? ""}
            title={`${typeName} ${bien.name ?? ""}`.trim()}
            detail={`${typeName} ${pieces} | ${bien.ville_commune ?? ""}, ${
              bien.pays ?? ""
            }`}
            bedrooms={bien.chambre ?? undefined}
            bathrooms={bien.salle_bains ?? undefined}
            capacity={bien.capacity ?? undefined}
            status={serviceName}
            furnished={furnished}
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
