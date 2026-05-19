import { ComingSoon } from "../../_components/coming-soon";

export const metadata = { title: "Promotions" };

export default function AdminPromotionsPage() {
  return (
    <ComingSoon
      title="Promotions"
      description="Publiez vos créas, offres et actualités directement sur le site."
      eta="Disponible cette semaine."
      features={[
        "Ajouter une nouvelle promotion (image, titre, description, lien CTA)",
        "Programmer les dates de début et de fin d'affichage",
        "Activer un bandeau promotionnel sur la page d'accueil",
        "Page publique /promotions qui affiche toutes les offres actives",
        "Aperçu en temps réel avant publication",
        "Archive automatique des promotions expirées",
      ]}
    />
  );
}
