import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCommunesAdmin } from "@/src/actions/admin/communes";
import { listQuartiersAdmin } from "@/src/actions/admin/quartiers";
import { GeographieClient } from "./geographie-client";
import { FlashBanner } from "../communes/flash-banner";

export const metadata = { title: "Communes & quartiers · Admin Mirna" };

/**
 * Gestion géographique unifiée.
 *
 * Communes et quartiers étaient administrés sur deux pages distinctes, alors
 * qu'un quartier n'existe que rattaché à une commune : on ne voyait ni le
 * rattachement, ni les communes restées sans quartier, ni les quartiers
 * orphelins — que la vitrine, elle, écarte de tous ses filtres.
 */
export default async function AdminGeographiePage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const [{ flash }, communes, quartiers] = await Promise.all([
    props.searchParams,
    listCommunesAdmin(),
    listQuartiersAdmin(),
  ]);

  const communesActives = communes.filter((c) => c.is_active).length;
  const aLaUne = communes.filter((c) => c.is_featured && c.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Communes &amp; quartiers
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {communes.length} commune{communes.length > 1 ? "s" : ""} dont{" "}
            {communesActives} active{communesActives > 1 ? "s" : ""} et {aLaUne} sur
            l&apos;accueil · {quartiers.length} quartier
            {quartiers.length > 1 ? "s" : ""}. Une commune ou un quartier sans bien
            rattaché n&apos;apparaît pas dans les filtres du site.
          </p>
        </div>
        <Button asChild>
          <Link
            href="/admin/communes/nouveau"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nouvelle commune
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {communes.length === 0 ? (
        <EmptyState />
      ) : (
        <GeographieClient communes={communes} quartiers={quartiers} />
      )}
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
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
        Commencez par les communes : les quartiers s&apos;y rattachent ensuite.
      </p>
      <Button asChild>
        <Link href="/admin/communes/nouveau">
          <Plus className="h-4 w-4 mr-1.5" /> Créer la première
        </Link>
      </Button>
    </div>
  );
}
