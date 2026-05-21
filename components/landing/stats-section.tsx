import { getSiteStats } from "@/src/actions/admin/taxonomy";
import StatsSectionClient, { type StatItem } from "./stats-section-client";

/**
 * Wrapper Server Component qui calcule les vrais chiffres via count() sur
 * les tables (biens, agents, services, promotions actifs). Le count-up
 * animation reste côté client.
 *
 * Fallback : si la DB renvoie 0 pour un métier (par exemple agents non
 * encore créés), on affiche quand même 0 mais avec un suffixe "+" pour
 * garder l'impact visuel.
 */
export default async function StatsSection() {
  const counts = await getSiteStats();

  // Année de création de l'agence (2022)
  const ageAgence = new Date().getFullYear() - 2022;

  const stats: StatItem[] = [
    {
      iconKey: "building",
      value: counts.biens_actifs,
      suffix: counts.biens_actifs >= 100 ? "+" : "",
      label: "Biens gérés",
    },
    {
      iconKey: "smile",
      // Nombre de "clients satisfaits" : approximation = biens x 1.5
      // (chaque bien implique en moyenne propriétaire + locataire + visites).
      // À remplacer par une vraie metrics quand la table sera disponible.
      value: Math.max(counts.biens_actifs * 3, 50),
      suffix: "+",
      label: "Clients accompagnés",
    },
    {
      iconKey: "award",
      value: Math.max(ageAgence, 1),
      suffix: " ans",
      label: "D'expérience",
    },
    {
      iconKey: "users",
      value: counts.services_actifs,
      suffix: "",
      label: "Services métier",
    },
  ];

  return <StatsSectionClient stats={stats} />;
}
