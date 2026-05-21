import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listQuartiersAdmin } from "@/src/actions/admin/quartiers";
import { QuartiersGrid } from "./quartiers-grid";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Quartiers · Admin Mirna" };

export default async function AdminQuartiersPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const items = await listQuartiersAdmin();
  const activeCount = items.filter((q) => q.is_active).length;
  const featuredCount = items.filter((q) => q.is_featured && q.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quartiers</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Communes et quartiers affichés sur la home et dans le dropdown
            Localisation. {activeCount} actif{activeCount > 1 ? "s" : ""} sur{" "}
            {items.length}, dont {featuredCount} mis en avant.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quartiers/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouveau quartier
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {items.length === 0 ? <EmptyState /> : <QuartiersGrid items={items} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <MapPin className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">
        Aucun quartier configuré
      </h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
        Ajoutez les zones où vous opérez pour les afficher en cards
        cliquables sur la page d'accueil.
      </p>
      <Button asChild>
        <Link href="/admin/quartiers/nouveau">
          <Plus className="h-4 w-4 mr-1.5" /> Créer le premier
        </Link>
      </Button>
    </div>
  );
}
