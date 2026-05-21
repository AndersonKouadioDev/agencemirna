import Link from "next/link";
import { Plus, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listTestimonialsAdmin } from "@/src/actions/admin/content";
import { TestimonialsGrid } from "./testimonials-grid";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Témoignages · Admin Mirna" };

export default async function AdminTestimonialsPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const items = await listTestimonialsAdmin();
  const activeCount = items.filter((t) => t.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Témoignages</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Les avis clients affichés dans le carousel de la page d'accueil.{" "}
            {activeCount} actif{activeCount > 1 ? "s" : ""} sur {items.length}.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouveau témoignage
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <TestimonialsGrid items={items} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <MessageSquareQuote className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">
        Aucun témoignage pour l'instant
      </h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
        Ajoutez les avis de vos clients pour les afficher en carousel sur la
        page d'accueil.
      </p>
      <Button asChild>
        <Link href="/admin/testimonials/nouveau">
          <Plus className="h-4 w-4 mr-1.5" /> Créer le premier
        </Link>
      </Button>
    </div>
  );
}
