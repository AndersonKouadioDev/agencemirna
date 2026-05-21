import AdresseSection from "@/components/adresse-section";
import DescriptionSection from "@/components/about/description-section";
import HeroSection from "@/components/about/hero-section";
import StatesSection from "@/components/about/states-section";
import ValueSection from "@/components/about/value-section";
import ClientSection from "@/components/client-section";
import AboutSection from "@/components/about/about-section";
import BlogSection from "@/components/landing/blog-section";
import CommoditiesSection from "@/components/landing/commodities-section";
import FAQSection from "@/components/landing/faq-section";

/**
 * Page /about enrichie — réceptacle des sections "détail" déplacées
 * depuis la home (Commodities, Blog, FAQ) pour alléger la home et créer
 * un véritable entonnoir narratif "raconter notre histoire".
 *
 * Flow :
 *  1. Hero About — notre raison d'être
 *  2. Histoire — qui sommes-nous
 *  3. Chiffres — preuves
 *  4. Partenaires — confiance
 *  5. Description détaillée
 *  6. Valeurs
 *  7. Commodités — équipements proposés (déplacé depuis home)
 *  8. Actualités & conseils — blog (déplacé depuis home)
 *  9. FAQ — questions fréquentes (déplacé depuis home)
 *  10. Adresse — CTA contact
 */
export default async function Page() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatesSection />
      <ClientSection />
      <DescriptionSection />
      <ValueSection />
      <CommoditiesSection />
      <BlogSection />
      <FAQSection />
      <AdresseSection />
    </>
  );
}
