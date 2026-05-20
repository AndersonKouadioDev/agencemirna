import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHomePromotion } from "@/src/actions/public";

/**
 * Bandeau promotionnel affiché sur la home si une promo est marquée
 * `show_on_home=true` côté admin. Server component : retourne null
 * silencieusement s'il n'y a pas de promo, donc transparent à inclure.
 */
export default async function HomePromoBanner() {
  const promo = await getHomePromotion();
  if (!promo) return null;

  return (
    <section className="relative isolate bg-secondary text-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Texte */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <Megaphone className="h-3.5 w-3.5" />
              Promotion en cours
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-agate font-bold leading-tight">
              {promo.title}
            </h2>
            {promo.description && (
              <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed whitespace-pre-wrap">
                {promo.description}
              </p>
            )}
            {promo.ends_at && (
              <p className="mt-4 text-sm text-white/70">
                Valable jusqu'au{" "}
                <span className="font-medium text-white">
                  {new Date(promo.ends_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {promo.cta_url && (
                <Button asChild size="lg">
                  <Link href={promo.cta_url}>
                    {promo.cta_label ?? "Découvrir"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/promotions">Voir toutes les offres</Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative aspect-[16/10] lg:aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
