import { ServicePageLayout } from "../_components/service-page";

export const metadata = {
  title: "Décoration d'intérieur et aménagement : Agence Mirna",
  description:
    "Aménagement et décoration sur-mesure pour sublimer vos espaces : design personnalisé, mobilier de créateurs et optimisation de l'espace.",
};

export default function DecorationAmenagementPage() {
  return (
    <ServicePageLayout
      slug="decoration-amenagement"
      name="Décoration d'intérieur"
      icon="Paintbrush"
      shortDescription="Aménagement et décoration sur-mesure pour sublimer vos espaces."
      longDescription="Nos architectes d'intérieur conçoivent des espaces uniques et fonctionnels qui reflètent votre style de vie. Du choix des matériaux à la sélection du mobilier, nous sublimons votre intérieur."
      highlights={[
        "Design sur-mesure",
        "Sélection de mobilier de créateurs",
        "Optimisation de l'espace",
      ]}
      cta={{ label: "Découvrir nos réalisations", href: "/contact_us" }}
    />
  );
}
