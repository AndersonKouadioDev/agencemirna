import { notFound } from "next/navigation";
import { getQuartierAdmin } from "@/src/actions/admin/quartiers";
import { QuartierForm } from "../quartier-form";

export const metadata = { title: "Édition quartier · Admin Mirna" };

export default async function EditQuartierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getQuartierAdmin(id);
  if (!row) notFound();
  return <QuartierForm row={row} />;
}
