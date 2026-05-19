import DescriptionSection from "@/components/properties/[property_id]/description-section";
import GallerySection from "@/components/properties/[property_id]/gallery-section";
import { getBienWithImages } from "@/src/actions/bien.actions";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ property_id: string }>;
}) {
  const params = await props.params;
  const bien = await getBienWithImages(params.property_id);

  if (!bien) {
    notFound();
  }

  return (
    <>
      <DescriptionSection bien={bien} />
      <GallerySection bien={bien} />
    </>
  );
}
