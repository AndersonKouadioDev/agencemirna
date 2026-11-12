import type { Metadata } from "next";
import { EmplacementPub } from "@/components/publicites/emplacement-pub";
import ContactContentSection from "@/components/contact_us/contact-content-section";
import HeroSection from "@/components/contact_us/hero-section";
import MapsSection from "@/components/contact_us/maps-section";
import { getSiteContact } from "@/src/lib/site-contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'Agence Mirna à Marcory Zone 4, Abidjan : téléphone, WhatsApp, e-mail ou formulaire, pour vos projets de location, d'achat ou de gestion de bien.",
  alternates: { canonical: "/contact_us" },
};

export default async function Page() {
  const settings = await getSiteContact();
  return (
    <>
      <HeroSection />
      <EmplacementPub cle="contact-haut" className="container mx-auto px-4 md:px-8 py-8" />
      <ContactContentSection settings={settings} />
      <MapsSection />
    </>
  );
}
