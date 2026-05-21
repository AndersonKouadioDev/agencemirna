import AdresseSection from "@/components/adresse-section";
import AboutSection from "@/components/landing/about-section";
import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import HomePromoBanner from "@/components/landing/home-promo-banner";
import PostersCarousel from "@/components/landing/posters-carousel";
import QuartiersSection from "@/components/landing/quartiers-section";
import SocialSection from "@/components/landing/social-section";
import StatsSection from "@/components/landing/stats-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/structured-data";

/**
 * Home : 11 sections resserrées (avant : 14).
 *
 * Réorganisation (mai 2026) :
 * - Retirés de la home : CategoryPills (redondant avec dropdown Type),
 *   CommoditiesSection (déplacé vers /about), BlogSection (vers /actualites
 *   ou /about future), FAQSection (vers /about)
 * - AboutSection devient un teaser court qui renvoie vers /about pour le détail
 *
 * Flow logique : découverte (hero + créas + quartiers) → biens (featured + promo)
 * → preuves sociales (stats + témoignages) → identité (about teaser + partenaires)
 * → connexion (social + adresse).
 */
export default async function Page() {
  return (
    <>
      {/* JSON-LD : Organization + WebSite avec SearchAction */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* Hero avec recherche premium intégrée */}
      <HeroSection />

      {/* Carousel horizontal des dernières affiches/créas (depuis Supabase) */}
      <PostersCarousel />

      {/* Nos quartiers : cards cliquables → /properties préfiltré */}
      <QuartiersSection />

      {/* Carousel des biens vedettes (depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* Bandeau promo dynamique (depuis Supabase, si show_on_home) */}
      <HomePromoBanner />

      {/* Chiffres clés animés (count-up scroll-triggered) */}
      <StatsSection />

      {/* Témoignages clients (carousel) */}
      <TestimonialsSection />

      {/* Teaser éditorial "Pourquoi nous" → CTA /about */}
      <AboutSection />

      {/* Partenaires (marquee logos) */}
      <ClientSection />

      {/* Suivez-nous + aside "On parle de nous" */}
      <SocialSection />

      {/* Adresse + map */}
      <AdresseSection />
    </>
  );
}
