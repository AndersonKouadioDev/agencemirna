import DescriptionSection from "@/components/properties/[property_id]/description-section";
import GallerySection from "@/components/properties/[property_id]/gallery-section";
import { getBienWithImages } from "@/src/actions/bien.actions";

export default async function Page(props: {
  params: Promise<{ property_id: string }>;
}) {
  const params = await props.params;
  const bien = await getBienWithImages(params.property_id);

  return (
    <>
      <DescriptionSection bien={bien} />
      <GallerySection bien={bien} />
    </>
  );
}
