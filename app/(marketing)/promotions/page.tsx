import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Megaphone, Sparkles } from "lucide-react";
import { Card, Chip } from "@heroui/react";
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
    <main className="bg-[#FAF5EE]">
      {/* HERO */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            En ce moment
          </div>

          <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-secondary leading-[1.05]">
            Promotions
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Nos offres en cours, nouveautés et créas pour vous accompagner
            dans votre projet immobilier.
          </p>
        </div>
      </section>

      {/* GRILLE PROMOS */}
      <section className="pb-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {promotions.length === 0 ? (
            <EmptyPromotions />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {promotions.map((promo) => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ============================================================================

function PromoCard({
  promo,
}: {
  promo: Awaited<ReturnType<typeof getActivePromotions>>[number];
}) {
  const endsAt = promo.ends_at ? new Date(promo.ends_at) : null;
  const isEndingSoon =
    endsAt && endsAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card
      variant="default"
      className="overflow-hidden bg-white border-stone-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
        <Image
          src={promo.image}
          alt={promo.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {isEndingSoon && (
          <Chip
            className="absolute top-4 right-4 bg-red-600 text-white border-red-600 shadow-md"
            size="sm"
          >
            Bientôt expirée
          </Chip>
        )}
      </div>

      <Card.Header className="pt-6">
        <Card.Title className="font-agate text-2xl sm:text-3xl text-secondary leading-tight">
          {promo.title}
        </Card.Title>
      </Card.Header>

      <Card.Content className="pb-4">
        {promo.description && (
          <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
            {promo.description}
          </p>
        )}
        {endsAt && (
          <p className="mt-4 text-sm text-neutral-500 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Valable jusqu'au{" "}
            <span className="font-semibold text-neutral-800">
              {endsAt.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        )}
      </Card.Content>

      {promo.cta_url && (
        <Card.Footer className="pb-6">
          <Button asChild className="rounded-full">
            <Link href={promo.cta_url}>
              {promo.cta_label ?? "Découvrir"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}

// ============================================================================

function EmptyPromotions() {
  return (
    <Card
      variant="default"
      className="bg-white border-stone-200 overflow-hidden"
    >
      <Card.Content className="p-12 sm:p-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
          <Megaphone className="h-7 w-7" />
        </div>
        <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary mb-2">
          Pas de promotion en cours
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto mb-6">
          Nos prochaines offres arrivent bientôt. En attendant, découvrez nos
          biens et nos services.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/properties">Voir les biens</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full hover:bg-stone-100 border-stone-300"
          >
            <Link href="/services">Nos services</Link>
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}
