import AdresseSection from "@/components/adresse-section";
import DescriptionSection from "@/components/about/description-section";
import HeroSection from "@/components/about/hero-section";
import StatesSection from "@/components/about/states-section";
import ValueSection from "@/components/about/value-section";
import ClientSection from "@/components/client-section";
import AboutSection from "@/components/about/about-section";
import MotGeranteSection from "@/components/about/mot-gerante-section";
import AboutServicesSection from "@/components/about/services-section";
import BlogSection from "@/components/landing/blog-section";
import CommoditiesSection from "@/components/landing/commodities-section";
import FAQSection from "@/components/landing/faq-section";

/**
 * Page /about enrichie : réceptacle des sections "détail" déplacées
 * depuis la home (Commodities, Blog, FAQ) pour alléger la home et créer
 * un véritable entonnoir narratif "raconter notre histoire".
 *
 * Flow :
 *   1. Hero About : notre raison d'être
 *   2. Histoire : qui sommes-nous
 *   3. Le mot de la gérante : la parole de la fondatrice, juste après que
 *      l'histoire l'a nommée (elle avait sa propre page, fusionnée ici)
 *   4. Chiffres : preuves
 *   5. Partenaires : confiance
 *   6. Description détaillée
 *   7. Valeurs
 *   8. Nos métiers : les six services, vers leurs pages dédiées
 *   9. Commodités : équipements proposés (déplacé depuis home)
 *  10. Actualités & conseils : blog (déplacé depuis home)
 *  11. FAQ : questions fréquentes (déplacé depuis home)
 *  12. Adresse : CTA contact
 */
export default async function Page() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MotGeranteSection />
      <StatesSection />
      <ClientSection />
      <DescriptionSection />
      <ValueSection />
      <AboutServicesSection />
      <CommoditiesSection />
      <BlogSection />
      <FAQSection />
      <AdresseSection />
    </>
  );
}
