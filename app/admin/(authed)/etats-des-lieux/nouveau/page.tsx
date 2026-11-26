import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listBiensEdl } from "@/src/actions/admin/etats-des-lieux";
import { CreationEdl } from "./creation-edl";

export const metadata = { title: "Nouvel état des lieux" };

export default async function NouvelEdlPage(props: {
  searchParams: Promise<{ bien?: string; entree?: string }>;
}) {
  const sp = await props.searchParams;
  const biens = await listBiensEdl();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/etats-des-lieux"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          États des lieux
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Nouvel état des lieux</h1>
      </div>
      <CreationEdl biens={biens} bienInitial={sp.bien ?? ""} entreeInitiale={sp.entree ?? ""} />
    </div>
  );
}
