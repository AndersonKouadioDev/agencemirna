import { ServicePageLayout } from "../_components/service-page";

export const metadata = {
  title: "Promotion immobilière et programmes neufs : Agence Mirna",
  description:
    "Développement de projets immobiliers résidentiels et commerciaux à Abidjan : emplacements de choix, architecture moderne et normes environnementales.",
};

export default function PromotionImmobilierePage() {
  return (
    <ServicePageLayout
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
