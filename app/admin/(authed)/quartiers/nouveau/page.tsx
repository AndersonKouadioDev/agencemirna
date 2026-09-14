import { QuartierForm } from "../quartier-form";
import { listCommunesAdmin } from "@/src/actions/admin/communes";

export const metadata = { title: "Nouveau quartier · Admin Mirna" };

export default async function NewQuartierPage(props: {
  searchParams: Promise<{ commune?: string }>;
}) {
  const [{ commune }, communes] = await Promise.all([
    props.searchParams,
    listCommunesAdmin(),
  ]);
  return <QuartierForm communes={communes} communeParDefaut={commune} />;
}
