
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCommunesAdmin } from "@/src/actions/admin/communes";
import { CommunesGrid } from "./communes-grid";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Communes · Admin Mirna" };

export default async function AdminCommunesPage(props: { searchParams: Promise<{ flash?: string }> }) {
  const { flash } = await props.searchParams;
  const items = await listCommunesAdmin();
  const activeCount = items.filter((q) => q.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Les communes permettent de regrouper vos quartiers (ex: Cocody, Marcory). {activeCount} actif{activeCount > 1 ? "s" : ""} sur {items.length}.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/communes/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvelle commune
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {items.length === 0 ? <EmptyState /> : <CommunesGrid items={items} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <MapPin className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">Aucune commune</h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">Ajoutez les grandes communes où se situent vos biens.</p>
      <Button asChild>
        <Link href="/admin/communes/nouveau"><Plus className="h-4 w-4 mr-1.5" /> Créer la première</Link>
      </Button>
    </div>
  );
}
