import { ServicePageLayout } from "../_components/service-page";

export const metadata = {
  title: "Gestion locative à Abidjan : Agence Mirna",
  description:
    "Confiez-nous la gestion de votre patrimoine immobilier : sélection des locataires, suivi comptable et garantie des loyers impayés.",
};

export default function GestionImmobilierePage() {
  return (
    <ServicePageLayout
      slug="gestion-immobiliere"
      name="Gestion locative"
      icon="Building"
      shortDescription="Confiez-nous la gestion de votre patrimoine immobilier en toute sérénité."
      longDescription="Nous prenons en charge la gestion complète de vos biens immobiliers : recherche de locataires, rédaction des baux, encaissement des loyers, gestion des travaux et de l'entretien."
      highlights={[
        "Sélection rigoureuse des locataires",
        "Suivi comptable et administratif",
        "Garantie des loyers impayés",
      ]}
      cta={{ label: "Nous confier votre bien", href: "/contact_us" }}
      bienService="Gestion locative"
    />
  );
}
