import Link from "next/link";
import {
  Building2,
  Home,
  KeyRound,
  Landmark,
  MapPin,
  Sofa,
} from "lucide-react";

/**
 * 6 pills catégories de recherche rapide.
 * Redirigent vers /properties avec les filtres pré-remplis.
 */

const CATEGORIES = [
  {
    icon: Building2,
    label: "Appartements",
    description: "Studios à T5",
    href: "/properties?type=appartement",
    color: "from-blue-500/10 to-blue-600/5 text-blue-700",
  },
  {
    icon: Home,
    label: "Villas",
    description: "Maisons & duplex",
    href: "/properties?type=villa",
    color: "from-emerald-500/10 to-emerald-600/5 text-emerald-700",
  },
  {
    icon: Sofa,
    label: "Meublés",
    description: "Location courte durée",
    href: "/properties?categorie=meuble",
    color: "from-primary/10 to-primary/5 text-primary",
  },
  {
    icon: KeyRound,
    label: "À louer",
    description: "Longue durée",
    href: "/properties?service=location",
    color: "from-purple-500/10 to-purple-600/5 text-purple-700",
  },
  {
    icon: MapPin,
    label: "Terrains",
    description: "À bâtir",
    href: "/properties?type=terrain",
    color: "from-amber-500/10 to-amber-600/5 text-amber-700",
  },
  {
    icon: Landmark,
    label: "Investir",
    description: "Programmes neufs",
    href: "/services/promotion-immobiliere",
    color: "from-rose-500/10 to-rose-600/5 text-rose-700",
  },
];

export default function CategoryPillsSection() {
  return (
    <section className="bg-white py-12 sm:py-16 border-y border-stone-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Recherche rapide
          </p>
          <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary">
            Que cherchez-vous ?
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col items-center text-center rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="text-sm sm:text-base font-semibold text-neutral-900 leading-tight">
                  {cat.label}
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                  {cat.description}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
