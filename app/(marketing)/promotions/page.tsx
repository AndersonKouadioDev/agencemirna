import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivePromotions } from "@/src/actions/public";

export const metadata = {
  title: "Promotions — Agence Mirna",
  description:
    "Découvrez nos promotions, créas et offres en cours sur Agence Mirna.",
};

export default async function PromotionsPage() {
  const promotions = await getActivePromotions();

  return (
    <main className="relative isolate bg-primary/5">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-agate font-bold tracking-tight">
          Promotions & actualités
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
          Nos offres en cours, nouveautés et créas pour vous accompagner dans
          votre projet immobilier.
        </p>
      </section>

      {/* Grille */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-32">
        {promotions.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <Megaphone className="h-10 w-10 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">
              Pas de promotion en cours
            </h2>
            <p className="text-sm text-neutral-600">
              Revenez bientôt — nos prochaines offres arrivent !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <article
                key={promo.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {promo.title}
                  </h2>
                  {promo.description && (
                    <p className="mt-2 text-sm text-neutral-600 flex-1 whitespace-pre-wrap">
                      {promo.description}
                    </p>
                  )}
                  {promo.ends_at && (
                    <p className="mt-3 text-xs text-neutral-500">
                      Valable jusqu'au{" "}
                      <span className="font-medium text-neutral-700">
                        {new Date(promo.ends_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                  {promo.cta_url && (
                    <Button asChild className="mt-4 w-fit">
                      <Link href={promo.cta_url}>
                        {promo.cta_label ?? "Découvrir"}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
