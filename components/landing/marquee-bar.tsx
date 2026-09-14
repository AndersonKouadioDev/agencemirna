import Link from "next/link";
import {
  Megaphone,
  Phone,
  Sparkles,
  ArrowRight,
  Newspaper,
} from "lucide-react";
import { getActiveAnnonces } from "@/src/actions/public";

/**
 * Bandeau défilant en haut de la home : annonces et liens rapides.
 * Server Component qui charge les promotions actives depuis Supabase.
 * - Si des promos actives existent, elles sont injectées au début
 * - Sinon, fallback sur les messages génériques utiles (estimation, tel, services)
 * - Animation CSS pure (marquee keyframe), pause au hover, respect reduced-motion
 */

type AnnouncementItem = {
  icon: typeof Sparkles;
  text: string;
  href: string;
};

const FALLBACK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    icon: Megaphone,
    text: "Estimation gratuite de votre bien : réponse sous 24h",
    href: "/contact_us",
  },
  {
    icon: Phone,
    text: "Une question ? Appelez-nous au +225 01 43 483 131",
    href: "tel:+22501434831131",
  },
  {
    icon: Newspaper,
    text: "Découvrez nos services : Gestion, Vente, Location meublée, Décoration",
    href: "/services",
  },
  {
    icon: Sparkles,
    text: "Nouveau : appartements meublés disponibles dès 50 000 FCFA/nuit",
    href: "/properties?service=location",
  },
];

export default async function MarqueeBar() {
  const promos = await getActiveAnnonces();

  // Construit la liste : promos actives (max 3) puis fallback pour remplir
  const promoItems: AnnouncementItem[] = promos.slice(0, 3).map((p) => ({
    icon: Sparkles,
    text: p.title,
    href: p.cta_url || "/annonces",
  }));

  const announcements: AnnouncementItem[] =
    promoItems.length > 0
      ? [...promoItems, ...FALLBACK_ANNOUNCEMENTS.slice(0, 2)]
      : FALLBACK_ANNOUNCEMENTS;

  // On duplique le contenu pour un défilement infini sans coupure
  const items = [...announcements, ...announcements];

  return (
    <div className="relative bg-secondary text-white overflow-hidden border-b border-[#F5B324]/20">
      <div
        className="flex group"
        role="region"
        aria-label="Annonces et informations"
      >
        <div className="flex shrink-0 animate-marquee-x group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {items.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link
                key={i}
                href={a.href}
                className="inline-flex items-center gap-2.5 py-3 px-8 text-sm font-medium hover:text-[#F5B324] transition-colors whitespace-nowrap border-r border-white/10"
              >
                <Icon className="h-4 w-4 text-[#F5B324] shrink-0" />
                <span>{a.text}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#F5B324] opacity-70" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
