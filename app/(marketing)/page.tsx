import AdresseSection from "@/components/adresse-section";
import AboutSection from "@/components/landing/about-section";
import BlogSection from "@/components/landing/blog-section";
import CategoryPillsSection from "@/components/landing/category-pills-section";
import ClientSection from "@/components/client-section";
import CommoditiesSection from "@/components/landing/commodities-section";
import FAQSection from "@/components/landing/faq-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import FeaturesSection from "@/components/landing/features-section";
import HeroSection from "@/components/landing/hero-section";
import HomePromoBanner from "@/components/landing/home-promo-banner";
import PostersCarousel from "@/components/landing/posters-carousel";
import QuartiersSection from "@/components/landing/quartiers-section";
import SocialSection from "@/components/landing/social-section";
import StatsSection from "@/components/landing/stats-section";
import TestimonialsSection from "@/components/landing/testimonials-section";

export default async function Page() {
  return (
    <>
      {/* Hero avec recherche intégrée */}
      <HeroSection />

      {/* Carousel horizontal des dernières affiches/créas (depuis Supabase) */}
      <PostersCarousel />

      {/* Catégories rapides */}
      <CategoryPillsSection />

      {/* Nos quartiers — cards cliquables → /properties préfiltré */}
      <QuartiersSection />

      {/* Carousel des biens vedettes (depuis Supabase) */}
      <FeaturedPropertiesServer />

      {/* Bandeau promo dynamique (depuis Supabase) */}
      <HomePromoBanner />

      {/* Chiffres clés animés */}
      <StatsSection />

      {/* Témoignages clients (carousel) */}
      <TestimonialsSection />

      {/* Commodités / amenities */}
      <CommoditiesSection />

      {/* À propos / pourquoi nous */}
      <AboutSection />

      {/* Actualités & Conseils du marché (3 articles) */}
      <BlogSection />

      {/* FAQ accordion */}
      <FAQSection />

      {/* Clients / partenaires */}
      <ClientSection />

      {/* Suivez-nous (réseaux sociaux + Instagram preview) */}
      <SocialSection />

      {/* Adresse / map */}
      <AdresseSection />
    </>
  );
}
