import MarqueeBar from "@/components/landing/marquee-bar";
import { SiteFooter } from "@/components/site-footer";
import { Header } from "@/components/site-header";
import { getMenuList } from "@/config/site";
import {
  getBienReferenceData,
  getCatalogueFacettes,
  listCommunesPublic,
} from "@/src/actions/public";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  // Point d'injection de la navigation dynamique : le Header est un composant
  // client, il ne peut pas interroger Supabase lui-même. On charge donc ici
  // types / services / communes et on lui passe le menu construit.
  const [communes, refData, facettes] = await Promise.all([
    listCommunesPublic(),
    getBienReferenceData(),
    getCatalogueFacettes(),
  ]);

  // Pathname vide : un Server Component ne le connaît pas. Le Header réapplique
  // l'état actif côté client via `applyActiveState`.
  const menu = getMenuList("", {
    communes,
    types: refData.types,
    services: refData.services,
    facettes,
  });

  return (
    <>
      {/* Bandeau d'annonces défilantes : fixé en haut, au-dessus du Header */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <MarqueeBar />
      </div>
      <Header menu={menu} />
      <main className="mx-auto flex-1">{children}</main>
      <SiteFooter communes={communes} />
    </>
  );
}
