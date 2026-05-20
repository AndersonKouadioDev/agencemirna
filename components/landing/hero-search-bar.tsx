"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumDropdown } from "./premium-dropdown";
import {
  ABIDJAN_LOCATIONS,
  BIEN_TYPES,
  BIEN_SERVICES,
} from "@/lib/abidjan-locations";

/**
 * Barre de recherche premium intégrée au hero.
 * - 3 dropdowns custom (Localisation Abidjan / Type / Service) + bouton Rechercher
 * - Le champ Localisation expose toutes les communes + quartiers d'Abidjan,
 *   groupés par commune dans le popover
 * - Redirige vers /properties?q=&type=&service= avec les valeurs choisies
 *   (le filtre côté /properties utilise includes() pour matcher tolérant)
 *
 * Design : white card flottante avec ombre douce, séparateurs verticaux
 * subtils, focus ring primary, bouton à droite plein.
 */
export default function HeroSearchBar() {
  const router = useRouter();
  const [location, setLocation] = React.useState("");
  const [type, setType] = React.useState("");
  const [service, setService] = React.useState("");

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("q", location);
    if (type) params.set("type", type);
    if (service) params.set("service", service);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-2 grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-1 items-stretch"
    >
      <div className="sm:border-r sm:border-stone-200/80">
        <PremiumDropdown
          label="Localisation"
          icon={MapPin}
          value={location}
          onChange={setLocation}
          placeholder="Toute la ville"
          options={ABIDJAN_LOCATIONS}
        />
      </div>

      <div className="sm:border-r sm:border-stone-200/80">
        <PremiumDropdown
          label="Type"
          icon={Building2}
          value={type}
          onChange={setType}
          placeholder="Tous les types"
          options={BIEN_TYPES}
        />
      </div>

      <div className="sm:border-r sm:border-stone-200/80">
        <PremiumDropdown
          label="Service"
          icon={Briefcase}
          value={service}
          onChange={setService}
          placeholder="Tous les services"
          options={BIEN_SERVICES}
        />
      </div>

      <Button
        type="submit"
        className="rounded-xl h-auto px-6 sm:px-8 self-stretch min-h-[64px]"
      >
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="sm:inline">Rechercher</span>
      </Button>
    </form>
  );
}
