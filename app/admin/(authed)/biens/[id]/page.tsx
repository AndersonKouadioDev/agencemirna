import { notFound } from "next/navigation";
import { getBienAdmin, getReferenceData } from "@/src/actions/admin/biens";
import { migrateBienImagesFromFolder } from "@/src/actions/bien.actions";
import { BienForm } from "../bien-form";

export const metadata = { title: "Édition bien" };

export default async function AdminEditBienPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // Reprise des images héritées (folder Storage ou cover unique) avant
  // lecture : idempotente, elle ne fait rien si la galerie est déjà peuplée.
  await migrateBienImagesFromFolder(id).catch(() => {});

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
