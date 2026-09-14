import { notFound } from "next/navigation";
import {
  getAnnonceAdmin,
  listBiensPourAnnonce,
  listTypesAnnonce,
} from "@/src/actions/admin/annonces";
import { AnnonceForm } from "../annonce-form";

export const metadata = { title: "Édition annonce" };

export default async function AdminEditPromotionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [promo, types, biens] = await Promise.all([
    getAnnonceAdmin(id),
    listTypesAnnonce(),
    listBiensPourAnnonce(),
  ]);
  if (!promo) notFound();
  return <AnnonceForm promo={promo} types={types} biens={biens} />;
}
