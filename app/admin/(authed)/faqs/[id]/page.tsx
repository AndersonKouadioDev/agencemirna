import { notFound } from "next/navigation";
import { getFaqAdmin } from "@/src/actions/admin/content";
import { FaqForm } from "../faq-form";

export const metadata = { title: "Édition question FAQ · Admin Mirna" };

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getFaqAdmin(id);
  if (!row) notFound();
  return <FaqForm row={row} />;
}
