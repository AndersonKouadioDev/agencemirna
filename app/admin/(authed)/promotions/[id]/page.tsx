import { notFound } from "next/navigation";
import { getPromotionAdmin } from "@/src/actions/admin/promotions";
import { PromotionForm } from "../promotion-form";

export const metadata = { title: "Édition promotion" };

export default async function AdminEditPromotionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const promo = await getPromotionAdmin(id);
  if (!promo) notFound();
  return <PromotionForm promo={promo} />;
}
