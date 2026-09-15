import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPublicitesAdmin } from "@/src/actions/admin/publicites";
import { FlashBanner } from "../annonces/flash-banner";
import { PublicitesGrid } from "./publicites-grid";

export const metadata = { title: "Publicités" };

export default async function AdminPublicitesPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const publicites = await listPublicitesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Publicités</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Image, texte ou vidéo, posées sur les emplacements du site.
            Plusieurs publicités au même endroit défilent en carrousel, dans
            l&apos;ordre où vous les glissez ici.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/publicites/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvelle publicité
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      <PublicitesGrid publicites={publicites} />
    </div>
  );
}
