import AdresseSection from "@/components/adresse-section";
import AboutSection from "@/components/landing/about-section";
import ClientSection from "@/components/client-section";
import CommoditiesSection from "@/components/landing/commodities-section";
import FeaturesSection from "@/components/landing/features-section";
import HeroSection from "@/components/landing/hero-section";
import HomePromoBanner from "@/components/landing/home-promo-banner";
import PropertySection from "@/components/landing/property-section";

export default async function Page() {
  return (
    <>
      <HeroSection />
      <PropertySection />
      <HomePromoBanner />
      <FeaturesSection />
      <CommoditiesSection />
      <AboutSection />
      <ClientSection />
      <AdresseSection />
    </>
  );
}
