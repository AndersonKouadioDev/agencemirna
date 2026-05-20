import AdresseSection from "@/components/adresse-section";
import AboutSection from "@/components/landing/about-section";
import CategoryPillsSection from "@/components/landing/category-pills-section";
import ClientSection from "@/components/client-section";
import CommoditiesSection from "@/components/landing/commodities-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import FeaturesSection from "@/components/landing/features-section";
import HeroSection from "@/components/landing/hero-section";
import HomePromoBanner from "@/components/landing/home-promo-banner";
import SocialSection from "@/components/landing/social-section";
import StatsSection from "@/components/landing/stats-section";

export default async function Page() {
  return (
    <>
      {/* Hero avec recherche intégrée */}
      <HeroSection />

      {/* Catégories rapides */}
      <CategoryPillsSection />

      {/* Carousel des biens vedettes (depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* Bandeau promo dynamique (depuis Supabase) */}
      <HomePromoBanner />

      {/* Chiffres clés animés */}
      <StatsSection />

      {/* Commodités / amenities */}
      <CommoditiesSection />

      {/* À propos / pourquoi nous */}
      <AboutSection />

      {/* Clients / partenaires */}
      <ClientSection />

      {/* Suivez-nous (réseaux sociaux + Instagram preview) */}
      <SocialSection />

      {/* Adresse / map */}
      <AdresseSection />
    </>
  );
}
