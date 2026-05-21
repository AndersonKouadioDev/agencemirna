"use client";

import * as React from "react";
import type { Key } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Briefcase } from "lucide-react";
import {
  Header,
  Label,
  ListBox,
  Select,
  Separator,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import {
  ABIDJAN_LOCATIONS,
  BIEN_TYPES,
  BIEN_SERVICES,
} from "@/lib/abidjan-locations";

/**
 * Barre de recherche intégrée au hero, refondue avec HeroUI Select v3
 * (compound pattern). Uniformisé avec la barre de filtres de /properties
 * pour garder une cohérence visuelle stricte sur tout le site.
 *
 * 3 dropdowns HeroUI :
 *   - Localisation : ABIDJAN_LOCATIONS groupées par commune (sections
 *     dans le popover)
 *   - Type de bien : statique (Appartement, Studio, Villa, etc.)
 *   - Service : statique (Vente, Location, Bail commercial, etc.)
 *
 * Le filtrage côté /properties utilise includes() bidirectionnel donc
 * compatible avec les valeurs envoyées ici.
 */

// Groupe les locations par commune pour ListBox.Section
const LOCATIONS_BY_COMMUNE = ABIDJAN_LOCATIONS.reduce(
  (acc, loc) => {
    if (!acc[loc.group]) acc[loc.group] = [];
    acc[loc.group].push(loc);
    return acc;
  },
  {} as Record<string, typeof ABIDJAN_LOCATIONS>,
);

export default function HeroSearchBar() {
  const router = useRouter();
  const [location, setLocation] = React.useState<Key | null>(null);
  const [type, setType] = React.useState<Key | null>(null);
  const [service, setService] = React.useState<Key | null>(null);

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("q", String(location));
    if (type) params.set("type", String(type));
    if (service) params.set("service", String(service));
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-2 grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-1 items-stretch"
    >
      {/* Localisation */}
      <div className="sm:border-r sm:border-stone-200/80 px-1">
        <Select
          aria-label="Localisation"
          placeholder="Toute la ville"
          selectedKey={location}
          onSelectionChange={setLocation}
          className="w-full"
        >
          <Label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3 pt-2 pb-0.5">
            Localisation
          </Label>
          <Select.Trigger className="w-full flex items-center gap-3 px-3 pb-2 hover:bg-neutral-50 rounded-xl transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[hovered=true]:bg-neutral-50">
            <MapPin
              className={`h-4 w-4 shrink-0 ${
                location ? "text-primary" : "text-neutral-400"
              }`}
            />
            <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 truncate data-[placeholder]:text-neutral-400" />
            <Select.Indicator className="text-neutral-400 data-[open=true]:text-primary transition-colors" />
          </Select.Trigger>
          <Select.Popover className="max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[280px]">
            <ListBox>
              {Object.entries(LOCATIONS_BY_COMMUNE).map(
                ([commune, items], idx) => (
                  <React.Fragment key={commune}>
                    {idx > 0 && <Separator className="my-1 bg-stone-100" />}
                    <ListBox.Section>
                      <Header className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-primary/80 sticky top-0 bg-white">
                        {commune}
                      </Header>
                      {items.map((opt) => (
                        <ListBox.Item
                          key={opt.value}
                          id={opt.value}
                          textValue={opt.label}
                          className="px-3 py-2 rounded-lg text-sm text-neutral-800 cursor-pointer flex items-center justify-between data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:font-semibold data-[hovered=true]:bg-stone-100 transition-colors"
                        >
                          {opt.label}
                          <ListBox.ItemIndicator className="text-primary">
                            ✓
                          </ListBox.ItemIndicator>
                        </ListBox.Item>
                      ))}
                    </ListBox.Section>
                  </React.Fragment>
                ),
              )}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* Type */}
      <div className="sm:border-r sm:border-stone-200/80 px-1">
        <Select
          aria-label="Type"
          placeholder="Tous les types"
          selectedKey={type}
          onSelectionChange={setType}
          className="w-full"
        >
          <Label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3 pt-2 pb-0.5">
            Type
          </Label>
          <Select.Trigger className="w-full flex items-center gap-3 px-3 pb-2 hover:bg-neutral-50 rounded-xl transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[hovered=true]:bg-neutral-50">
            <Building2
              className={`h-4 w-4 shrink-0 ${
                type ? "text-primary" : "text-neutral-400"
              }`}
            />
            <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 truncate data-[placeholder]:text-neutral-400" />
            <Select.Indicator className="text-neutral-400 data-[open=true]:text-primary transition-colors" />
          </Select.Trigger>
          <Select.Popover className="max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[220px]">
            <ListBox>
              {BIEN_TYPES.filter((t) => t.value).map((opt) => (
                <ListBox.Item
                  key={opt.value}
                  id={opt.value}
                  textValue={opt.label}
                  className="px-3 py-2 rounded-lg text-sm text-neutral-800 cursor-pointer flex items-center justify-between data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:font-semibold data-[hovered=true]:bg-stone-100 transition-colors"
                >
                  {opt.label}
                  <ListBox.ItemIndicator className="text-primary">
                    ✓
                  </ListBox.ItemIndicator>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* Service */}
      <div className="sm:border-r sm:border-stone-200/80 px-1">
        <Select
          aria-label="Service"
          placeholder="Tous les services"
          selectedKey={service}
          onSelectionChange={setService}
          className="w-full"
        >
          <Label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3 pt-2 pb-0.5">
            Service
          </Label>
          <Select.Trigger className="w-full flex items-center gap-3 px-3 pb-2 hover:bg-neutral-50 rounded-xl transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[hovered=true]:bg-neutral-50">
            <Briefcase
              className={`h-4 w-4 shrink-0 ${
                service ? "text-primary" : "text-neutral-400"
              }`}
            />
            <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 truncate data-[placeholder]:text-neutral-400" />
            <Select.Indicator className="text-neutral-400 data-[open=true]:text-primary transition-colors" />
          </Select.Trigger>
          <Select.Popover className="max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[220px]">
            <ListBox>
              {BIEN_SERVICES.filter((s) => s.value).map((opt) => (
                <ListBox.Item
                  key={opt.value}
                  id={opt.value}
                  textValue={opt.label}
                  className="px-3 py-2 rounded-lg text-sm text-neutral-800 cursor-pointer flex items-center justify-between data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:font-semibold data-[hovered=true]:bg-stone-100 transition-colors"
                >
                  {opt.label}
                  <ListBox.ItemIndicator className="text-primary">
                    ✓
                  </ListBox.ItemIndicator>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
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
