import { notFound } from "next/navigation";
import { getAnnonceAdmin } from "@/src/actions/admin/annonces";
import { AnnonceForm } from "../annonce-form";

export const metadata = { title: "Édition annonce" };

export default async function AdminEditPromotionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const promo = await getAnnonceAdmin(id);
  if (!promo) notFound();
  return <AnnonceForm promo={promo} />;
}
