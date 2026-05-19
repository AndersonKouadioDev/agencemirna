import { getReferenceData } from "@/src/actions/admin/biens";
import { BienForm } from "../bien-form";

export const metadata = { title: "Nouveau bien" };

export default async function AdminNewBienPage() {
  const reference = await getReferenceData();
  return <BienForm reference={reference} />;
}
