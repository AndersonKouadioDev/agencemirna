import HeroSection from "@/components/properties/hero-section";
import ListPropertiesSection from "@/components/properties/list-properties-section";
import { getAllBiens } from "@/src/actions/bien.actions";
import { getBienReferenceData } from "@/src/actions/public";

/**
 * Page publique /properties.
 * Server Component qui :
 *  - charge les biens + données de référence (types, services) côté serveur
 *  - passe les query params initiaux au client pour pré-remplir les filtres
 *
 * Filtres supportés via URL : ?q=&type=&service=&location=
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = {
    q: typeof sp.q === "string" ? sp.q : "",
    type: typeof sp.type === "string" ? sp.type : "",
    service: typeof sp.service === "string" ? sp.service : "",
    location: typeof sp.location === "string" ? sp.location : "",
  };

  const [biens, refData] = await Promise.all([
    getAllBiens(),
    getBienReferenceData(),
  ]);

  return (
    <>
      <HeroSection />
      <ListPropertiesSection
        initialBiens={biens ?? []}
        types={refData.types}
        services={refData.services}
        initialFilters={initial}
      />
    </>
  );
}
