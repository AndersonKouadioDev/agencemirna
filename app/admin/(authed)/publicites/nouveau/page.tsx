import { listBiensPourPublicite } from "@/src/actions/admin/publicites";
import { PubliciteForm } from "../publicite-form";

export const metadata = { title: "Nouvelle publicité" };

export default async function AdminNewPublicitePage() {
  const biens = await listBiensPourPublicite();
  return <PubliciteForm biens={biens} />;
}
