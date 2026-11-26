import { PageAtterrissage, metadataPageSeo } from "@/components/seo/page-atterrissage";
import { PAGES_SEO } from "@/src/data/pages-seo";

const page = PAGES_SEO["studio-meuble-abidjan"];

export const metadata = metadataPageSeo(page);

export default function Page() {
  return <PageAtterrissage page={page} />;
}
