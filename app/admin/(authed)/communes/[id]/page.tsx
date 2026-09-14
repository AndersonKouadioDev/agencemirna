
import { notFound } from "next/navigation";
import { getCommuneAdmin } from "@/src/actions/admin/communes";
import { CommuneForm } from "../commune-form";
export const metadata = { title: "Édition commune" };
export default async function AdminEditCommunePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await getCommuneAdmin(id);
  if (!item) notFound();
  return <CommuneForm item={item} />;
}
