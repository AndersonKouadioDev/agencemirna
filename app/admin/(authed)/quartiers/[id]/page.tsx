import { notFound } from "next/navigation";
import { getQuartierAdmin } from "@/src/actions/admin/quartiers";
import { QuartierForm } from "../quartier-form";
import { listCommunesAdmin } from "@/src/actions/admin/communes";

export const metadata = { title: "Édition quartier · Admin Mirna" };

export default async function EditQuartierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getQuartierAdmin(id);
  if (!row) notFound();
  const communes = await listCommunesAdmin();
  return <QuartierForm row={row} communes={communes} />;
}
