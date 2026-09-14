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
  area?: number | string | null;
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
        // Le décompte de pièces se déduit des pièces saisies, pas du rang de
        // `types_bien` : tester `types_bien.id > 1` masquait la mention pour
        // le type dont l'identifiant vaut 1, au hasard de l'ordre de la table.
        const nbPieces = (bien.chambre ?? 0) + (bien.salon ?? 0);
        const pieces = nbPieces > 0 ? `${nbPieces} pièce${nbPieces > 1 ? "s" : ""}` : "";
        // Toutes ces colonnes sont nullables : la concaténation littérale
        // rendait « | Cocody, » sur un bien sans type ni pièces ni pays. On
        // n'assemble que les morceaux réellement renseignés.
        const lieu = [bien.ville_commune, bien.pays]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(", ");
        const detail = [[typeName, pieces].filter(Boolean).join(" "), lieu]
          .filter(Boolean)
          .join(" | ");

        return (
          <PropertyCard
            key={bien.id}
            id={bien.id}
            imageUrl={bien.image}
            altText={bien.name ?? ""}
            localisation={bien.localisation ?? undefined}
            // `address` est facultative en admin : sans ce repli, la carte
            // affichait une épingle nue au-dessus du titre.
            address={bien.address?.trim() || lieu}
            title={`${typeName} ${bien.name ?? ""}`.trim()}
            detail={detail}
            bedrooms={bien.chambre ?? undefined}
            bathrooms={bien.salle_bains ?? undefined}
            capacity={bien.capacity ?? undefined}
            area={bien.area ? `${bien.area} m²` : undefined}
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
