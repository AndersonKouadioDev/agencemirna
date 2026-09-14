import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  Home,
  Users,
  Star,
  Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./newsletter-form";
import { getSiteContact } from "@/src/lib/site-contact";
import {
  getCatalogueFacettes,
  type CatalogueFacettes,
} from "@/src/actions/public";

const STATS = [
  { icon: Home, value: "100+", label: "Biens" },
  { icon: Users, value: "50K+", label: "Clients satisfaits" },
  { icon: Star, value: "4.8", label: "Avis moyen" },
  { icon: Clock, value: "24/7", label: "Support" },
];

/** Commune telle que reçue du layout marketing (sous-ensemble de PublicCommune). */
type FooterCommune = {
  id: string;
  nom: string;
  slug: string;
};

export async function SiteFooter({
  communes = [],
  facettes,
}: {
  communes?: FooterCommune[];
  /** Le layout marketing charge déjà ce comptage pour le méga-menu : sans
   *  cette prop, le pied de page relance la même requête sur chaque page
   *  vitrine. On retombe sur un chargement local pour les appelants qui ne
   *  la transmettent pas encore. */
  facettes?: CatalogueFacettes;
} = {}) {
  const [settings, comptage] = await Promise.all([
    getSiteContact(),
    facettes ?? getCatalogueFacettes(),
  ]);
  // « Top Lieux » émettait `?loc=`, un paramètre que /properties ne lit plus :
  // ces liens renvoyaient la liste complète, sans filtre. On repart des
  // communes en base et du paramètre du contrat d'URL, `?commune=<slug>`.
  //
  // La liste reçue contient toutes les communes actives, dont la majorité ne
  // porte aucun bien : le lien menait alors à un catalogue vide que le
  // visiteur ne pouvait pas expliquer, le sélecteur de localisation masquant
  // justement ces communes. On applique donc la même garde par facettes que
  // le méga-menu. Comptage indisponible : on n'écarte rien.
  const communesAvecBiens = comptage.disponible
    ? communes.filter((c) => (comptage.communes[c.id] ?? 0) > 0)
    : communes;
  const topLieux = communesAvecBiens.slice(0, 4);
  return (
    <section className="bg-white pt-20 pb-10 border-t border-stone-100">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-stone-100 mb-16">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-[#F5B324] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-secondary">{stat.value}</span>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{stat.label}</span>
                </div>
              </div>
            );
          })}
          {/* Socials on the right in mockup, we can put them anywhere, let's add them to the right of stats on desktop */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4 flex justify-between items-center mt-4 md:mt-0 lg:absolute lg:right-8 lg:mt-2">
             <div className="hidden lg:flex items-center gap-4">
               <span className="text-sm font-semibold text-stone-600">Suivez-nous</span>
               <div className="flex gap-2">
                 {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#F5B324] hover:bg-[#F5B324] hover:text-white transition-all shadow-sm"><FacebookIcon className="h-4 w-4" /></a>}
                 {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#F5B324] hover:bg-[#F5B324] hover:text-white transition-all shadow-sm"><InstagramIcon className="h-4 w-4" /></a>}
                 {settings?.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#F5B324] hover:bg-[#F5B324] hover:text-white transition-all shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>}
                 {settings.whatsapp && <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#F5B324] hover:bg-[#F5B324] hover:text-white transition-all shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg></a>}
               </div>
             </div>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Logo & Intro */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/images/logo.png" alt="Agence Mirna Logo" width={140} height={40} className="h-auto w-32" />
              
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              Nous vous rapprochons des plus belles propriétés avec des expériences inoubliables.
            </p>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h4 className="font-bold text-secondary mb-6">L'Agence</h4>
            <div className="flex flex-col gap-4 text-sm text-stone-500">
              <Link href="/about" className="hover:text-primary transition-colors">À propos</Link>
              <Link href="/agents" className="hover:text-primary transition-colors">Notre équipe</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">Presse</Link>
              <Link href="/contact_us" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col">
            <h4 className="font-bold text-secondary mb-6">Support</h4>
            <div className="flex flex-col gap-4 text-sm text-stone-500">
              <Link href="/contact_us" className="hover:text-primary transition-colors">Centre d'aide</Link>
              <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
              <Link href="/conditions-generales" className="hover:text-primary transition-colors">Conditions générales</Link>
              <Link href="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
            </div>
          </div>

          {/* Top Destinations — masqué tant qu'aucune commune n'est disponible */}
          {topLieux.length > 0 && (
            <div className="flex flex-col">
              <h4 className="font-bold text-secondary mb-6">Top Lieux</h4>
              <div className="flex flex-col gap-4 text-sm text-stone-500">
                {topLieux.map((commune) => (
                  <Link
                    key={commune.id}
                    href={`/properties?commune=${encodeURIComponent(commune.slug)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {commune.nom}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter */}
          <div className="lg:col-span-1 flex flex-col">
            <h4 className="font-bold text-secondary mb-6">Newsletter</h4>
            <p className="text-sm text-stone-500 mb-4">
              Abonnez-vous pour recevoir des offres exclusives et de l'inspiration.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-stone-100 text-xs text-stone-400">
          <p>© 2026 Agence Mirna. Tous droits réservés.</p>
          <p className="mt-2 md:mt-0">
            Développé par <a href="https://lunion-lab.com" target="_blank" className="hover:text-primary">LUNION-LAB</a>
          </p>
        </div>
      </div>
    </section>
  );
}