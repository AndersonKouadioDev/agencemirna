import * as React from "react";
import Link from "next/link";
import { Building2, Home, Briefcase, Map, Store, BedDouble } from "lucide-react";

const CATEGORIES = [
  { icon: Building2, label: "Appartement", href: "/properties?type=Appartement" },
  { icon: Home, label: "Villa", href: "/properties?type=Villa" },
  { icon: Map, label: "Terrain", href: "/properties?type=Terrain" },
  { icon: Briefcase, label: "Bureaux", href: "/properties?type=Bureau" },
  { icon: Store, label: "Commerce", href: "/properties?type=Commerce" },
  { icon: BedDouble, label: "Hôtel", href: "/properties?type=Hôtel" },
];

export default function CategoriesSection() {
  return (
    <section className="py-12 bg-[#FAF5EE]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-y-8 gap-x-4 sm:gap-12 md:gap-16">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.href}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 group-hover:border-primary group-hover:text-primary transition-all shadow-sm group-hover:shadow-md">
                  <Icon className="h-6 w-6 md:h-8 md:w-8 stroke-[1.5]" />
                </div>
                <span className="text-[13px] md:text-sm font-semibold text-stone-600 group-hover:text-primary transition-colors text-center">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
