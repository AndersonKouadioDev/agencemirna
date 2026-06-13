import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import HomePromoBanner from "@/components/landing/home-promo-banner";
import QuartiersSection from "@/components/landing/quartiers-section";
import ServicesGridSection from "@/components/landing/services-grid-section";
import SocialSection from "@/components/landing/social-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import VideoSection from "@/components/landing/video-section";
import WhyChooseSection from "@/components/landing/why-choose-section";
import CtaBannerSection from "@/components/landing/cta-banner-section";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/structured-data";

/**
 * Home structurée (mai 2026) — narration claire, sans doublon.
 *
 * Flow :
 *   1. Hero (accroche + recherche)
 *   2. Services (ce qu'on fait)
 *   3. Pourquoi nous (atouts + chiffres clés fusionnés)
 *   4. Quartiers (où)
 *   5. Biens vedettes (la sélection)
 *   6. Vidéo (showcase, conditionnel)
 *   7. Promotion (offre du moment)
 *   8. Témoignages (preuve sociale — avis)
 *   9. CTA final (conversion)
 *   10. Partenaires (logos)
 *   11. Suivez-nous (réseaux)
 *
 * Nettoyage cohérence :
 *  - StatsSection fusionnée dans WhyChooseSection (une seule section
 *    réassurance au lieu de deux).
 *  - PostersCarousel retiré (doublon de la promo "Studios Cocody").
 *  - "On parle de nous" retiré de SocialSection (doublon des témoignages).
 *  - AdresseSection retirée de la home (reste sur /about).
 */
export default async function Page() {
  return (
    <>
      {/* JSON-LD : Organization + WebSite avec SearchAction */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* 1. Hero plein écran : carousel image+texte + recherche intégrée */}
      <HeroSection />

      {/* 2. Nos services : grille métier */}
      <ServicesGridSection />

      {/* 3. Pourquoi nous : atouts + chiffres clés (fusionnés) */}
      <WhyChooseSection />

      {/* 4. Nos quartiers : cards cliquables → /properties préfiltré */}
      <QuartiersSection />

      {/* 5. Biens vedettes (depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* 6. Vidéo (depuis Supabase, si show_on_home) — sinon ne se rend pas */}
      <VideoSection />

      {/* 7. Promotion en cours (depuis Supabase, si show_on_home) */}
      <HomePromoBanner />

      {/* 8. Témoignages clients (carousel) */}
      <TestimonialsSection />

      {/* 9. Bandeau CTA final : estimation / contact */}
      <CtaBannerSection />

      {/* 10. Partenaires (marquee logos) */}
      <ClientSection />

      {/* 11. Suivez-nous (réseaux + Instagram) */}
      <SocialSection />
    </>
  );
}
