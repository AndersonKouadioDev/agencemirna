import { ComingSoon } from "../../_components/coming-soon";

export const metadata = { title: "Agents" };

export default function AdminAgentsPage() {
  return (
    <ComingSoon
      title="Agents"
      description="Présentez votre équipe sur le site public."
      eta="Disponible cette semaine."
      features={[
        "Créer une fiche agent (photo, nom, rôle, téléphone, email, WhatsApp)",
        "Définir les spécialités (Vente, Location, Gestion...)",
        "Bio personnalisée affichée sur le site public",
        "Activer/désactiver un agent (ex: en congé)",
        "Réorganiser l'ordre d'affichage de l'équipe",
        "Page publique /agents avec la grille de l'équipe",
      ]}
    />
  );
}
