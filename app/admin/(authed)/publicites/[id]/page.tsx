import { notFound } from "next/navigation";
import { getPubliciteAdmin, listBiensPourPublicite } from "@/src/actions/admin/publicites";
import { PubliciteForm } from "../publicite-form";

export const metadata = { title: "Édition publicité" };

export default async function AdminEditPublicitePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [pub, biens] = await Promise.all([getPubliciteAdmin(id), listBiensPourPublicite()]);
  if (!pub) notFound();
  return <PubliciteForm pub={pub} biens={biens} />;
}
