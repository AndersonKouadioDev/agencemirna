import { ComingSoon } from "../../_components/coming-soon";

export const metadata = { title: "Services" };

export default function AdminServicesPage() {
  return (
    <ComingSoon
      title="Services"
      description="Configurez les pages publiques de vos 6 services métier."
      eta="Disponible cette semaine."
      features={[
        "Éditer les 6 services (Vente, Gestion immobilière, Location meublée, Décoration, Construction, Promotion)",
        "Pour chaque service : titre, description courte, description longue, image, icône",
        "Liste des points clés (highlights) qui apparaissent sur la page publique",
        "Bouton d'action (CTA) personnalisable par service",
        "Réorganisation des services par drag-and-drop",
        "Activer/désactiver un service sans le supprimer",
      ]}
    />
  );
}
