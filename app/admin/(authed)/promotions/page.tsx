import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPromotionsAdmin } from "@/src/actions/admin/promotions";
import { PromotionsGrid } from "./promotions-grid";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Promotions" };

export default async function AdminPromotionsPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const promotions = await listPromotionsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Publiez vos créas et offres sur le site :{" "}
            {promotions.length} promotion{promotions.length > 1 ? "s" : ""}.
            Cochez "afficher sur la home" pour mettre en avant une promo.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promotions/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvelle promotion
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      <PromotionsGrid promotions={promotions} />
    </div>
  );
}
