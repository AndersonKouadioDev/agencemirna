import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import ServicesShowcase from "@/components/landing/services-showcase";
import TestimonialsSection from "@/components/landing/testimonials-section";
import VideoSection from "@/components/landing/video-section";
import WhyChooseSection from "@/components/landing/why-choose-section";
import CtaBannerSection from "@/components/landing/cta-banner-section";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/structured-data";

/**
 * Home structurée (mai 2026) — direction éditoriale premium.
 *
 * Flow :
 *   1. Hero (accroche + recherche)
 *   2. Grands services en séquence (colonne vertébrale, vitrines) :
 *        Construction → Vente → Gestion locative → Appartements meublés
 *   3. Pourquoi nous (atouts + chiffres clés)
 *   4. Nos biens disponibles (catalogue live depuis le backoffice)
 *   5. Vidéo (showcase, conditionnel)
 *   6. Témoignages (preuve sociale — avis)
 *   7. CTA final (conversion)
 *   8. Partenaires (logos)
 *
 * Note : la grille "Nos services" (aperçu) a été retirée car redondante
 * avec la séquence vitrine. La séquence remonte juste après le hero
 * (colonne vertébrale voulue : les grands services de haut en bas).
 */
export default async function Page() {
  return (
    <>
      {/* JSON-LD : Organization + WebSite avec SearchAction */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* 1. Hero plein écran : carousel image+texte + recherche intégrée */}
      <HeroSection />

      {/* 2. Grands services en séquence (vitrines) */}
      <ServicesShowcase />

      {/* 3. Pourquoi nous : atouts + chiffres clés */}
      <WhyChooseSection />

      {/* 4. Nos biens disponibles (catalogue live depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* 5. Vidéo (depuis Supabase, si show_on_home) — sinon ne se rend pas */}
      <VideoSection />

      {/* 6. Témoignages clients (carousel) */}
      <TestimonialsSection />

      {/* 7. Bandeau CTA final : estimation / contact */}
      <CtaBannerSection />

      {/* 8. Partenaires (marquee logos) */}
      <ClientSection />
    </>
  );
}
