import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listBiensAdmin } from "@/src/actions/admin/biens";
import { BiensTable } from "./biens-table";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Biens" };

export default async function AdminBiensPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const biens = await listBiensAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biens</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez votre portefeuille de biens immobiliers : {biens.length}{" "}
            bien{biens.length > 1 ? "s" : ""} au total.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/biens/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouveau bien
          </Link>
        </Button>
      </div>

      {/* Flash messages depuis ?flash=created/updated/deleted */}
      {flash && <FlashBanner type={flash} />}

      {/* Table */}
      <BiensTable biens={biens} />
    </div>
  );
}
