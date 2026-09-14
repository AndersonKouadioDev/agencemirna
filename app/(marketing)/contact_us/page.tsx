import ContactContentSection from "@/components/contact_us/contact-content-section";
import HeroSection from "@/components/contact_us/hero-section";
import MapsSection from "@/components/contact_us/maps-section";
import { getSiteSettings } from "@/src/actions/admin/settings";

export default async function Page() {
  const settings = await getSiteSettings();
  return (
    <>
      <HeroSection />
      <ContactContentSection settings={settings} />
      <MapsSection />
    </>
  );
}
