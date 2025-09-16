import AdresseSection from "@/components/adresse-section";
import DescriptionSection from "@/components/about/description-section";
import HeroSection from "@/components/about/hero-section";
import StatesSection from "@/components/about/states-section";
import ValueSection from "@/components/about/value-section";
import ClientSection from "@/components/client-section";
import AboutSection from "@/components/about/about-section";

export default async function Page() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatesSection />
      <ClientSection />
      <DescriptionSection />
      <ValueSection />
      <AdresseSection />
    </>
  );
}
