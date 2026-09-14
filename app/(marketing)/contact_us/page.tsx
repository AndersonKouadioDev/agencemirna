import ContactContentSection from "@/components/contact_us/contact-content-section";
import HeroSection from "@/components/contact_us/hero-section";
import MapsSection from "@/components/contact_us/maps-section";
import { getSiteContact } from "@/src/lib/site-contact";

export default async function Page() {
  const settings = await getSiteContact();
  return (
    <>
      <HeroSection />
      <ContactContentSection settings={settings} />
      <MapsSection />
    </>
  );
}
