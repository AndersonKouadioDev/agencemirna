import HeroSection from "@/components/properties/hero-section";
import ListPropertiesSection from "@/components/properties/list-properties-section";
import { getAllBiens } from "@/src/actions/bien.actions";
import { getBienReferenceData, listCommunesPublic, getActiveQuartiers } from "@/src/actions/public";

const norm = (v: unknown) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/**
 * Page publique /properties.
 *
 * Contrat d'URL :
 *   ?q=        recherche plein texte
 *   ?type=     libellé exact d'un type_bien
 *   ?service=  libellé exact d'un service_bien
 *   ?commune=  slug d'une commune
 *   ?quartier= identifiant ou nom d'un quartier
 *
 * `?location=` et `?loc=` restent acceptés : ils étaient émis par le footer,
 * les cartes de communes et le méga-menu, mais `loc` n'était lu nulle part —
 * ces liens renvoyaient donc la liste complète, sans filtre ni explication.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");

  const [biens, refData, communes, quartiers] = await Promise.all([
    getAllBiens(),
    getBienReferenceData(),
    listCommunesPublic(),
    getActiveQuartiers(),
  ]);

  let commune = str("commune");
  let quartier = str("quartier");

  // Résolution des alias historiques : on tente d'abord un quartier, puis une
  // commune, en comparant sans accent ni casse.
  const legacy = str("location") || str("loc");
  if (legacy && !commune && !quartier) {
    const l = norm(legacy);
    const q = quartiers.find(
      (x) => norm(x.name) === l || norm(x.search_query) === l,
    );
    if (q) {
      quartier = q.id;
    } else {
      const c = communes.find((x) => norm(x.nom) === l || norm(x.slug) === l);
      if (c) commune = c.slug;
    }
  }

  const initial = {
    q: str("q"),
    type: str("type"),
    service: str("service"),
    commune,
    quartier,
  };

  return (
    <>
      <HeroSection />
      <ListPropertiesSection
        initialBiens={biens ?? []}
        types={refData.types}
        services={refData.services}
        initialFilters={initial}
        communes={communes}
        quartiers={quartiers}
      />
    </>
  );
}
