import MarqueeBar from "@/components/landing/marquee-bar";
import { SiteFooter } from "@/components/site-footer";
import { Header } from "@/components/site-header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <>
      {/* Bandeau d'annonces défilantes : fixé en haut, au-dessus du Header */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <MarqueeBar />
      </div>
      <Header />
      <main className="mx-auto flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}


