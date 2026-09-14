import { ServicePageLayout } from "../_components/service-page";

// Page éditoriale sans aucune donnée d'administration : pré-générée au
// build plutôt que rendue à chaque requête.
export const dynamic = "force-static";

export const metadata = {
  title: "Location meublée à Abidjan : Agence Mirna",
  description:
    "Appartements et villas meublés prêts à vivre, pour de courtes ou longues durées : biens équipés, conciergerie et flexibilité de durée.",
};

export default function LocationMeubleePage() {
  return (
    <ServicePageLayout
      slug="location-meublee"
      name="Location meublée"
      icon="Sofa"
      shortDescription="Des appartements et villas meublés prêts à vivre pour de courtes ou longues durées."
      longDescription="Profitez de notre sélection de biens meublés de haut standing, idéals pour vos séjours professionnels ou vos vacances. Nos logements sont soigneusement équipés pour vous offrir un confort optimal."
      highlights={[
        "Biens équipés",
        "Service de conciergerie",
        "Flexibilité de durée",
      ]}
      cta={{ label: "Nous contacter", href: "/contact_us" }}
      bienService="Location meublée"
    />
  );
}
