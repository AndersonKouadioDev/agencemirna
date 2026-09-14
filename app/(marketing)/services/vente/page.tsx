import { ServicePageLayout } from "../_components/service-page";

// Page éditoriale sans aucune donnée d'administration : pré-générée au
// build plutôt que rendue à chaque requête.
export const dynamic = "force-static";

export const metadata = {
  title: "Vente de biens immobiliers à Abidjan : Agence Mirna",
  description:
    "Achat et vente de villas, terrains et appartements haut de gamme à Abidjan : estimation précise, visibilité maximale et accompagnement juridique.",
};

export default function VentePage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
      slug="vente"
      name="Vente de biens immobiliers"
      icon="Key"
      shortDescription="Achat et vente de villas, terrains et appartements haut de gamme."
      longDescription="Nous vous accompagnons à chaque étape de votre transaction immobilière, de l'estimation de votre bien jusqu'à la signature chez le notaire, en vous garantissant une transaction sécurisée et au meilleur prix."
      highlights={[
        "Estimation précise",
        "Visibilité maximale",
        "Accompagnement juridique",
      ]}
      cta={{ label: "Estimer mon bien", href: "/estimation" }}
      bienService="Vente"
    />
  );
}
