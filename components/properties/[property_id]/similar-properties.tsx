import { getAllBiens } from "@/src/actions/bien.actions";
import PropertyCard from "@/components/property-card";
import { formatNumber } from "@/utils/formatNumber";

/**
 * `getAllBiens()` renvoie `any[]` : sans ce type local, une colonne fantôme
 * passait inaperçue de tsc et arrivait à `undefined` dans la carte — c'est ce
 * qui rendait ici le lien d'adresse inerte pendant des mois. Il ne liste que
 * les colonnes réellement présentes dans `biens`.
 */
type BienCarte = {
  id: string;
  image: string | null;
  name: string | null;
  ville_commune: string | null;
  localisation: string | null;
  description: string | null;
  short_description: string | null;
  capacity: number | null;
  area: string | number | null;
  chambre: number | null;
  salle_bains: number | null;
  prix: number | null;
  prix_month: number | null;
  services_bien?: { name: string | null } | null;
  categories_bien?: { name: string | null } | null;
};

export default async function SimilarProperties({ currentBienId }: { currentBienId: string }) {
  const allBiens = (await getAllBiens()) as BienCarte[];

  // On écarte le bien courant et on garde les trois premiers.
  const similarBiens = allBiens
    .filter((bien) => bien.id !== currentBienId)
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
          {similarBiens.map((bien) => {
            const categorie = (bien.categories_bien?.name ?? "").toLowerCase();

            return (
              <PropertyCard
                key={bien.id}
                id={bien.id}
                imageUrl={bien.image}
                altText={bien.name || "Bien"}
                address={bien.ville_commune || "Abidjan"}
                title={bien.name || "Bien immobilier"}
                // La colonne est `localisation` ; `lien_localisation` n'existe
                // pas dans `biens` et arrivait donc toujours à `undefined`.
                localisation={bien.localisation ?? undefined}
                // `short_description` existe précisément pour cette ligne
                // tronquée : la description longue y était coupée net.
                detail={bien.short_description || bien.description || "Magnifique bien"}
                capacity={bien.capacity ?? undefined}
                area={bien.area ? `${bien.area} m²` : undefined}
                bedrooms={bien.chambre ?? undefined}
                bathrooms={bien.salle_bains ?? undefined}
                status={bien.services_bien?.name || "Disponible"}
                furnished={
                  categorie
                    ? categorie.includes("meubl") && !categorie.includes("non meubl")
                    : undefined
                }
                price={bien.prix ? `${formatNumber(bien.prix)} FCFA` : ""}
                pricePerMonth={bien.prix_month ? `${formatNumber(bien.prix_month)} FCFA` : ""}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
