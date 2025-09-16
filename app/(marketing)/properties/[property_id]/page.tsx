import DescriptionSection from "@/components/properties/[property_id]/description-section";
import GallerySection from "@/components/properties/[property_id]/gallery-section";
import { getBienWithImages } from "@/src/actions/bien.actions";
import { DateRangePicker } from "@nextui-org/date-picker";

export default async function Page({
  params,
}: {
  params: { property_id: string };
}) {
  const bien = await getBienWithImages(params.property_id);

  return (
    <>
      <DescriptionSection bien={bien} />
      <GallerySection bien={bien} />
    </>
  );
}

