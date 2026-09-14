import { ServicePageLayout } from "../_components/service-page";

// Page éditoriale sans aucune donnée d'administration : pré-générée au
// build plutôt que rendue à chaque requête.
export const dynamic = "force-static";

export const metadata = {
  title: "Construction de votre projet immobilier : Agence Mirna",
  description:
    "De la conception à la remise des clés : expertise technique, suivi de chantier et respect des délais pour vos projets de construction à Abidjan.",
};

export default function ConstructionPage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200"
      slug="construction"
      name="Construction"
      bienService="Construction"
      icon="HardHat"
      shortDescription="Réalisation de vos projets de construction de la conception à la remise des clés."
      longDescription="Notre équipe d'experts vous accompagne dans la réalisation de votre projet de construction, en veillant au respect des normes de qualité, des délais et de votre budget."
      highlights={[
        "Expertise technique",
        "Suivi de chantier",
        "Respect des délais",
      ]}
      cta={{ label: "Discuter de votre projet", href: "/contact_us" }}
    />
  );
}
