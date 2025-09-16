import ContactContentSection from "@/components/contact_us/contact-content-section";
import HeroSection from "@/components/contact_us/hero-section";
import MapsSection from "@/components/contact_us/maps-section";

export default async function Page() {
  return (
    <>
      <HeroSection />
      <ContactContentSection />
      <MapsSection />
    </>
  );
}
