import { QuartierForm } from "../quartier-form";
import { listCommunesAdmin } from "@/src/actions/admin/communes";

export const metadata = { title: "Nouveau quartier · Admin Mirna" };

export default async function NewQuartierPage() {
  const communes = await listCommunesAdmin();
  return <QuartierForm communes={communes} />;
}
