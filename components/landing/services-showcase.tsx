import * as React from "react";
import { HardHat, BedDouble, Home, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: HardHat,
    title: "Construction",
    desc: "Projets bâtis de A à Z.",
    href: "/services/construction",
  },
  {
    icon: Home,
    title: "Vente de biens",
    desc: "Biens d'exception sélectionnés.",
    href: "/properties?service=Vente",
  },
  {
    icon: BedDouble,
    title: "Appartements meublés",
    desc: "Confort et vue sur mer.",
    href: "/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e",
  },
  {
    icon: Building2,
    title: "Gestion locative",
    desc: "Rentabilité en toute sérénité.",
    href: "/properties?service=Gestion%20locative",
  },
];

export default function ServicesShowcase() {
  return (
    <section className="relative z-30 mt-4 sm:-mt-8 mb-12 px-4 md:px-8 max-w-[1400px] mx-auto">
      <div className="bg-white rounded-3xl md:rounded-full p-5 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center justify-between gap-6 md:gap-0 md:divide-x divide-stone-100">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Link
              key={idx}
              href={feature.href}
              className="flex items-center gap-4 w-full md:px-4 group hover:scale-105 transition-transform"
            >
              <div className="bg-stone-50 group-hover:bg-primary/10 transition-colors p-3.5 rounded-full text-stone-600 group-hover:text-primary shrink-0">
                <Icon className="h-6 w-6 stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-secondary group-hover:text-primary transition-colors">
                  {feature.title}
                </span>
                <span className="text-[13px] text-stone-500 font-medium leading-tight mt-0.5">
                  {feature.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
