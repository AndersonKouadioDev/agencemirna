import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Page placeholder "Bientôt disponible" pour les sections du back-office
 * pas encore implémentées. Affiche un message clair + un aperçu des
 * fonctionnalités à venir + un lien retour au dashboard.
 *
 * Évite les 404 bruts quand on clique sur un item de la sidebar dont la
 * page n'existe pas encore.
 */
export function ComingSoon({
  title,
  description,
  features,
  eta,
}: {
  title: string;
  description: string;
  features: string[];
  eta?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header de page */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      {/* Bloc "bientôt disponible" */}
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Construction className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Bientôt disponible</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Cette section est en cours de développement.{" "}
              {eta && <span className="font-medium">{eta}</span>}
            </p>

            <div className="w-full text-left">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Ce que vous pourrez faire ici
              </h3>
              <ul className="space-y-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
