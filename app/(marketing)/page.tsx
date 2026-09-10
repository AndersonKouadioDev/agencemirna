import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import ServicesShowcase from "@/components/landing/services-showcase";
import CategoriesSection from "@/components/landing/categories-section";
import NewsGuidesSection from "@/components/landing/news-guides-section";
import CtaBannerSection from "@/components/landing/cta-banner-section";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/structured-data";

export default async function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      <div className="bg-white">
        {/* 1. Hero */}
      <HeroSection />

      {/* 2. Bandeau Services */}
      <ServicesShowcase />

      {/* 3. Nos biens disponibles (catalogue live depuis Supabase) - Style "Popular Destinations" */}
      <FeaturedPropertiesServer />
      </div>

      {/* 4. Categories (Appartement, Villa, etc.) */}
      <CategoriesSection />

      {/* 5. Actualités & Guides */}
      <NewsGuidesSection />

      {/* 6. Bandeau CTA final */}
      <CtaBannerSection />
    </>
  );
}
