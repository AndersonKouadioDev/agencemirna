import Link from "next/link";
import { Megaphone, Phone, Sparkles, ArrowRight, Newspaper } from "lucide-react";

/**
 * Bandeau défilant en haut de la home — annonces et liens rapides.
 * Animation CSS pure (marquee keyframe) — pas de JS, performant.
 * Pause au hover. Respecte prefers-reduced-motion (s'arrête).
 */

const ANNOUNCEMENTS = [
  {
    icon: Sparkles,
    text: "Nouveau : appartements meublés disponibles à Cocody dès 60 000 FCFA/nuitée",
    href: "/properties",
  },
  {
    icon: Megaphone,
    text: "Estimation gratuite de votre bien — réponse sous 24h",
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
];

export default function MarqueeBar() {
  // On duplique le contenu pour un défilement infini sans coupure
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <div className="relative bg-secondary text-white overflow-hidden border-b border-white/5">
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
                className="inline-flex items-center gap-2 py-2.5 px-6 text-xs sm:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap border-r border-white/10"
              >
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{a.text}</span>
                <ArrowRight className="h-3 w-3 opacity-50" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
