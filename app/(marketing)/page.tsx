import ClientSection from "@/components/client-section";
import FeaturedPropertiesServer from "@/components/landing/featured-properties-server";
import HeroSection from "@/components/landing/hero-section";
import ServicesShowcase from "@/components/landing/services-showcase";
import CategoriesSection from "@/components/landing/categories-section";
import ServicesBento from "@/components/landing/services-bento";
import NewsGuidesSection from "@/components/landing/news-guides-section";
import CtaBannerSection from "@/components/landing/cta-banner-section";
import CommunesSection from "@/components/landing/communes-section";
import { getSiteContact } from "@/src/lib/site-contact";
import TestimonialsSection from "@/components/landing/testimonials-section";
import AnnouncementsSection from "@/components/landing/announcements-section";
import { getActiveQuartiers, getBienReferenceData, listCommunesPublic, getActiveTestimonials, getCatalogueFacettes } from "@/src/actions/public";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/structured-data";

export default async function Page() {
  const [communes, quartiers, refData, testimonials, contact, facettes] =
    await Promise.all([
    listCommunesPublic(),
    getActiveQuartiers(),
    getBienReferenceData(),
    getActiveTestimonials(),
    getSiteContact(),
    getCatalogueFacettes(),
  ]);
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      <div className="bg-white pb-12">
        {/* 1. Hero & Search */}
        <HeroSection communes={communes} quartiers={quartiers} types={refData.types} services={refData.services} whatsappUrl={contact.whatsappMessageUrl} facettes={facettes} />
        {/* 2. Bandeau Services Rapides */}
        <ServicesShowcase />
      </div>

      {/* 3. Opportunités (Promotions & Nouveautés) - Urgence & Ventes */}
      <AnnouncementsSection />

      {/* 4. Nos biens d'exception (Catalogue) */}
      <FeaturedPropertiesServer />

      {/* 5. Catégories de biens */}
      <CategoriesSection types={refData.types} facettes={facettes} />

      {/* 6. Quartiers Phares */}
      <CommunesSection communes={communes} />

      {/* 7. Expertise & Services Détaillés (Construction, Gestion...) */}
      <ServicesBento />

      {/* 8. Preuve Sociale (Avis) */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 9. Appel à l'action principal (Estimation / Leads) */}
      <CtaBannerSection />

      {/* 10. Actualités & Guides (SEO & Engagement) */}
      <NewsGuidesSection />
    </>
  );
}