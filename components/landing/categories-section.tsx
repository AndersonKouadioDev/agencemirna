import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Home,
  Briefcase,
  Map,
  Store,
  BedDouble,
  Warehouse,
  Layers,
  DoorOpen,
} from "lucide-react";

type TypeBien = { id: number; name: string };

/**
 * Icône associée à un type de bien, par mot-clé.
 * Les types sont gérés depuis l'admin : on ne peut pas les énumérer en dur.
 */
function iconePour(name: string) {
  const n = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (n.includes("villa") || n.includes("maison")) return Home;
  if (n.includes("terrain")) return Map;
  if (n.includes("bureau")) return Briefcase;
  if (n.includes("commercial") || n.includes("commerce")) return Store;
  if (n.includes("entrepot")) return Warehouse;
  if (n.includes("immeuble")) return Layers;
  if (n.includes("studio")) return DoorOpen;
  if (n.includes("duplex") || n.includes("appartement")) return Building2;
  return BedDouble;
}

/**
 * Pastilles de raccourci vers le catalogue, par type de bien.
 *
 * Les types viennent de `types_bien` : la liste en dur qu'ils remplacent
 * pointait vers « Commerce » et « Hôtel », deux libellés absents de la base —
 * ces deux pastilles menaient donc à un catalogue vide.
 */
export default function CategoriesSection({
  types = [],
  facettes,
}: {
  types?: TypeBien[];
  facettes?: { types: Record<string, number>; disponible: boolean };
}) {
  // Même règle que le menu : ne pas proposer un raccourci vers un catalogue
  // vide. Sans comptage disponible, on affiche tout.
  const visibles =
    facettes?.disponible
      ? types.filter((t) => (facettes.types[String(t.id)] ?? 0) > 0)
      : types;
  if (visibles.length === 0) return null;

  return (
    <section className="py-12 bg-[#FAF5EE]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-y-8 gap-x-4 sm:gap-12 md:gap-16">
          {visibles.slice(0, 8).map((t) => {
            const Icon = iconePour(t.name);
            return (
              <Link
                key={t.id}
                href={`/properties?type=${encodeURIComponent(t.name)}` as any}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 group-hover:border-primary group-hover:text-primary transition-all shadow-sm group-hover:shadow-md">
                  <Icon className="h-6 w-6 md:h-8 md:w-8 stroke-[1.5]" />
                </div>
                <span className="text-[13px] md:text-sm font-semibold text-stone-600 group-hover:text-primary transition-colors text-center">
                  {t.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
