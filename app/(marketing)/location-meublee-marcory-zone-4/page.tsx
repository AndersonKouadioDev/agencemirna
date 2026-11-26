import { PageAtterrissage, metadataPageSeo } from "@/components/seo/page-atterrissage";
import { PAGES_SEO } from "@/src/data/pages-seo";

const page = PAGES_SEO["location-meublee-marcory-zone-4"];

export const metadata = metadataPageSeo(page);

export default function Page() {
  return <PageAtterrissage page={page} />;
}
