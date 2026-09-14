import { ServicePageLayout } from "../_components/service-page";

// Page éditoriale sans aucune donnée d'administration : pré-générée au
// build plutôt que rendue à chaque requête.
export const dynamic = "force-static";

export const metadata = {
  title: "Promotion immobilière et programmes neufs : Agence Mirna",
  description:
    "Développement de projets immobiliers résidentiels et commerciaux à Abidjan : emplacements de choix, architecture moderne et normes environnementales.",
};

export default function PromotionImmobilierePage() {
  return (
    <ServicePageLayout
      image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200"
      slug="promotion-immobiliere"
      name="Promotion immobilière"
      icon="Briefcase"
      shortDescription="Développement de projets immobiliers résidentiels et commerciaux."
      longDescription="Nous développons des programmes immobiliers neufs de qualité, répondant aux attentes du marché et offrant d'excellentes opportunités d'investissement ou d'habitation."
      highlights={[
        "Emplacements de choix",
        "Architecture moderne",
        "Normes environnementales",
      ]}
      cta={{ label: "Nos programmes neufs", href: "/contact_us" }}
    />
  );
}
