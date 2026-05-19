import { ComingSoon } from "../../_components/coming-soon";

export const metadata = { title: "Paramètres" };

export default function AdminParametresPage() {
  return (
    <ComingSoon
      title="Paramètres"
      description="Configuration générale du site et de votre compte."
      eta="Disponible plus tard dans le MVP."
      features={[
        "Coordonnées de l'agence affichées dans le footer (adresse, téléphone, email)",
        "Liens vers les réseaux sociaux (Instagram, Facebook, LinkedIn, WhatsApp)",
        "Gestion des comptes admin (inviter un nouveau membre de l'équipe)",
        "Changer votre mot de passe et email",
        "Préférences de notifications email",
        "Historique des connexions",
      ]}
    />
  );
}
