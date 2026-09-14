import {
  listBiensPourAnnonce,
  listTypesAnnonce,
} from "@/src/actions/admin/annonces";
import { AnnonceForm } from "../annonce-form";

export const metadata = { title: "Nouvelle annonce" };

export default async function AdminNewPromotionPage() {
  const [types, biens] = await Promise.all([
    listTypesAnnonce(),
    listBiensPourAnnonce(),
  ]);
  return <AnnonceForm types={types} biens={biens} />;
}
