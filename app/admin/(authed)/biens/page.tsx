import { ComingSoon } from "../../_components/coming-soon";

export const metadata = { title: "Biens" };

export default function AdminBiensPage() {
  return (
    <ComingSoon
      title="Biens"
      description="Gérez votre portefeuille de biens immobiliers."
      eta="Disponible la semaine prochaine."
      features={[
        "Liste de tous les biens avec recherche et filtres (statut, type, ville, prix)",
        "Création et édition complète d'une fiche bien",
        "Galerie photos multi-images avec drag-to-reorder",
        "Changement de statut rapide (disponible / réservé / vendu / loué)",
        "Duplication d'un bien pour gagner du temps",
        "Suppression sécurisée avec confirmation",
      ]}
    />
  );
}
