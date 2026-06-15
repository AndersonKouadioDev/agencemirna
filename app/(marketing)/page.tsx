import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import ServicesGridSection from "@/components/landing/services-grid-section";
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
 * Home structurée (mai 2026).
 *
 * Flow :
 *   1. Hero (accroche + recherche)
 *   2. Services (grille aperçu)
 *   3. Pourquoi nous (atouts + chiffres clés)
 *   4. Grands services en séquence (vitrines, de haut en bas) :
 *        Vente → Gestion locative → Appartements meublés → Construction
 *   5. Nos biens disponibles (catalogue live depuis le backoffice)
 *   6. Vidéo (showcase, conditionnel)
 *   7. Témoignages (preuve sociale — avis)
 *   8. CTA final (conversion)
 *   9. Partenaires (logos)
 *
 * Demande direction : mettre en avant les 4-5 grands services qui se suivent
 * de haut en bas (ServicesShowcase). Les biens réels restent gérés au
 * backoffice par type de service (vente, location, maison, terrain…).
 * Quartiers + bandeau promo retirés : remplacés par la séquence vitrine.
 */
export default async function Page() {
  return (
    <>
      {/* JSON-LD : Organization + WebSite avec SearchAction */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* 1. Hero plein écran : carousel image+texte + recherche intégrée */}
      <HeroSection />

      {/* 2. Nos services : grille aperçu */}
      <ServicesGridSection />

      {/* 3. Pourquoi nous : atouts + chiffres clés (fusionnés) */}
      <WhyChooseSection />

      {/* 4. Grands services en séquence (vitrines) */}
      <ServicesShowcase />

      {/* 5. Nos biens disponibles (catalogue live depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* 6. Vidéo (depuis Supabase, si show_on_home) — sinon ne se rend pas */}
      <VideoSection />

      {/* 7. Témoignages clients (carousel) */}
      <TestimonialsSection />

      {/* 8. Bandeau CTA final : estimation / contact */}
      <CtaBannerSection />

      {/* 9. Partenaires (marquee logos) */}
      <ClientSection />
    </>
  );
}
