import { notFound } from "next/navigation";
import { getBienAdmin, getReferenceData } from "@/src/actions/admin/biens";
import { BienForm } from "../bien-form";

export const metadata = { title: "Édition bien" };

export default async function AdminEditBienPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [result, reference] = await Promise.all([
    getBienAdmin(id),
    getReferenceData(),
  ]);

  if (!result) {
    notFound();
  }

  return (
    <BienForm
      bien={result.bien}
      images={result.images}
      reference={reference}
    />
  );
}
