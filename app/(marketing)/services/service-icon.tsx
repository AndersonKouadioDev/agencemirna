import * as Lucide from "lucide-react";
import { Sparkles } from "lucide-react";

/**
 * Rend une icône Lucide à partir de son nom string (ex: "Home", "Building2").
 * Si le nom est invalide ou absent, fallback sur Sparkles.
 */
export function ServiceIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  if (!name) {
    return <Sparkles className={className} />;
  }
  // `name` vient de la donnée et n'est connu qu'à l'exécution : on indexe le
  // namespace de lucide-react, dont les membres sont hétérogènes (composants,
  // types, utilitaires). Aucun type ne décrit cet accès dynamique, d'où le
  // `any` ; le garde `if (!Icon)` juste en dessous couvre les noms inconnus.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Lucide as any)[name];
  if (!Icon) {
    return <Sparkles className={className} />;
  }
  return <Icon className={className} />;
}
