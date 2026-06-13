import AdresseSection from "@/components/adresse-section";
import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import HomePromoBanner from "@/components/landing/home-promo-banner";
import PostersCarousel from "@/components/landing/posters-carousel";
import QuartiersSection from "@/components/landing/quartiers-section";
import ServicesGridSection from "@/components/landing/services-grid-section";
import SocialSection from "@/components/landing/social-section";
import StatsSection from "@/components/landing/stats-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import VideoSection from "@/components/landing/video-section";
import WhyChooseSection from "@/components/landing/why-choose-section";
import CtaBannerSection from "@/components/landing/cta-banner-section";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/structured-data";

/**
 * Home refondue (mai 2026) — narration façon landing premium, alignée sur
 * le mockup validé :
 *
 *   Hero plein écran → Nos services → Pourquoi nous → (créas, quartiers)
 *   → Biens vedettes → Vidéo → Promo → Stats → Témoignages → CTA final
 *   → Partenaires → Social → Adresse
 *
 * AboutSection retirée : remplacée par WhyChooseSection (même rôle "Pourquoi
 * Agence Mirna", même CTA /about).
 */
export default async function Page() {
  return (
    <>
      {/* JSON-LD : Organization + WebSite avec SearchAction */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* Hero plein écran : image + overlay marron + recherche intégrée */}
      <HeroSection />

      {/* Nos services : grille métier (fond marron) */}
      <ServicesGridSection />

      {/* Pourquoi nous choisir : image + atouts */}
      <WhyChooseSection />

      {/* Carousel horizontal des dernières affiches/créas (depuis Supabase) */}
      <PostersCarousel />

      {/* Nos quartiers : cards cliquables → /properties préfiltré */}
      <QuartiersSection />

      {/* Carousel des biens vedettes (depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* Vidéo (depuis Supabase, si show_on_home) — ne se rend pas si aucune */}
      <VideoSection />

      {/* Bandeau promo dynamique (depuis Supabase, si show_on_home) */}
      <HomePromoBanner />

      {/* Chiffres clés animés (count-up scroll-triggered) */}
      <StatsSection />

      {/* Témoignages clients (carousel) */}
      <TestimonialsSection />

      {/* Bandeau CTA final : estimation / contact */}
      <CtaBannerSection />

      {/* Partenaires (marquee logos) */}
      <ClientSection />

      {/* Suivez-nous + aside "On parle de nous" */}
      <SocialSection />

      {/* Adresse + map */}
      <AdresseSection />
    </>
  );
}
