import { notFound } from "next/navigation";
import { getSocialMentionAdmin } from "@/src/actions/admin/content";
import { MentionForm } from "../mention-form";

export const metadata = { title: "Édition mention · Admin Mirna" };

export default async function EditMentionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getSocialMentionAdmin(id);
  if (!row) notFound();
  return <MentionForm row={row} />;
}
