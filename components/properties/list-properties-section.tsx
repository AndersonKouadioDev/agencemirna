"use client";

import * as React from "react";
import type { Key } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Building2,
  Briefcase,
  ArrowDownUp,
  Map as MapIcon,
  List,
} from "lucide-react";
import { PropertiesMap } from "./properties-map";
import {
  Header,
  Label as HeroLabel,
  ListBox,
  Select,
  Separator,
} from "@heroui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import PropertySection from "./property-section";
import Motion from "../motion";
import { cn } from "@/lib/utils";
import { ABIDJAN_LOCATIONS } from "@/lib/abidjan-locations";

type RefItem = { id: number; name: string };

type Filters = {
  q: string;
  type: string;
  service: string;
  location: string;
  priceMin: string;
  priceMax: string;
  chambres: string;
  sort: string;
};

const EMPTY_FILTERS: Filters = {
  q: "",
  type: "",
  service: "",
  location: "",
  priceMin: "",
  priceMax: "",
  chambres: "",
  sort: "",
};

// Groupe les locations par commune pour ListBox.Section
const LOCATIONS_BY_COMMUNE = ABIDJAN_LOCATIONS.reduce(
  (acc, loc) => {
    if (!acc[loc.group]) acc[loc.group] = [];
    acc[loc.group].push(loc);
    return acc;
  },
  {} as Record<string, typeof ABIDJAN_LOCATIONS>,
);

const CHAMBRES_OPTIONS = [
  { value: "1", label: "1+ chambre" },
  { value: "2", label: "2+ chambres" },
  { value: "3", label: "3+ chambres" },
  { value: "4", label: "4+ chambres" },
  { value: "5", label: "5+ chambres" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Nom A-Z" },
];

/**
 * Listing + filtres /properties, uniformisé avec le hero search.
 *
 * Composants : HeroUI Select compound (Select.Trigger / Select.Popover /
 * ListBox.Item) partout, plus shadcn pour les Inputs. Le dropdown
 * Localisation expose toutes les communes/quartiers d'Abidjan groupés
 * (comme dans le hero), pour une cohérence visuelle stricte.
 */
export default function ListPropertiesSection({
  initialBiens,
  types,
  services,
  initialFilters,
}: {
  initialBiens: any[];
  types: RefItem[];
  services: RefItem[];
  initialFilters: Partial<Filters>;
}) {
  const [filters, setFilters] = React.useState<Filters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [viewMode, setViewMode] = React.useState<"list" | "map">("list");

  const filteredBiens = React.useMemo(() => {
    let list = initialBiens.filter((bien: any) => {
      if (filters.q) {
        const q = filters.q.toLowerCase().trim();
        const haystack = [
          bien.name,
          bien.address,
          bien.ville_commune,
          bien.pays,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.location) {
        const loc = filters.location.toLowerCase().trim();
        const hay = [bien.address, bien.ville_commune, bien.pays]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(loc)) return false;
      }
      if (filters.type && bien.types_bien?.name) {
        // Match tolérant : si l'un contient l'autre (case-insensitive),
        // on accepte. Évite d'exclure quand l'URL et la DB diffèrent
        // légèrement (singulier/pluriel, accent, etc.).
        const t = filters.type.toLowerCase().trim();
        const name = bien.types_bien.name.toLowerCase();
        if (name !== t && !name.includes(t) && !t.includes(name))
          return false;
      }
      if (filters.service && bien.services_bien?.name) {
        const svc = filters.service.toLowerCase().trim();
        const name = bien.services_bien.name.toLowerCase();
        if (name !== svc && !name.includes(svc) && !svc.includes(name))
          return false;
      }
      const priceMin = filters.priceMin ? parseInt(filters.priceMin, 10) : null;
      const priceMax = filters.priceMax ? parseInt(filters.priceMax, 10) : null;
      if (priceMin !== null || priceMax !== null) {
        const p = bien.prix ?? bien.prix_month ?? null;
        if (p === null) return false;
        if (priceMin !== null && p < priceMin) return false;
        if (priceMax !== null && p > priceMax) return false;
      }
      const chMin = filters.chambres ? parseInt(filters.chambres, 10) : null;
      if (chMin !== null && (bien.chambre ?? 0) < chMin) return false;
      return true;
    });

    if (filters.sort === "price_asc") {
      list = [...list].sort(
        (a, b) => (a.prix ?? a.prix_month ?? 0) - (b.prix ?? b.prix_month ?? 0),
      );
    } else if (filters.sort === "price_desc") {
      list = [...list].sort(
        (a, b) => (b.prix ?? b.prix_month ?? 0) - (a.prix ?? a.prix_month ?? 0),
      );
    } else if (filters.sort === "name_asc") {
      list = [...list].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? ""),
      );
    }
    return list;
  }, [initialBiens, filters]);

  return (
    <section
      id="hero"
      className="relative isolate py-32 mx-auto max-w-screen-2xl"
    >
      <PropertySearchBar
        filters={filters}
        setFilters={setFilters}
        types={types}
        services={services}
      />
      {filteredBiens.length > 0 ? (
        <>
          <div className="px-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-screen-xl mx-auto">
            <div className="text-sm text-neutral-600">
              <span className="font-semibold text-secondary">
                {filteredBiens.length}
              </span>{" "}
              bien{filteredBiens.length > 1 ? "s" : ""} trouvé
              {filteredBiens.length > 1 ? "s" : ""}
              {filters.q && (
                <>
                  {" · "}
                  <span className="italic">recherche « {filters.q} »</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
              />
              <SortSelect
                value={filters.sort}
                onChange={(v) =>
                  setFilters({ ...filters, sort: v === "recent" ? "" : v })
                }
              />
            </div>
          </div>
          {viewMode === "map" ? (
            <PropertiesMap biens={filteredBiens} />
          ) : (
            <PropertySection biens={filteredBiens} />
          )}
        </>
      ) : (
        <NoPropertyFound />
      )}
    </section>
  );
}

// ─── Toggle Vue liste / Vue carte ──────────────────────────────────────────
function ViewModeToggle({
  value,
  onChange,
}: {
  value: "list" | "map";
  onChange: (v: "list" | "map") => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-stone-200 bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          value === "list"
            ? "bg-secondary text-white"
            : "text-neutral-600 hover:text-secondary",
        )}
        aria-pressed={value === "list"}
      >
        <List className="h-3.5 w-3.5" />
        Liste
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          value === "map"
            ? "bg-secondary text-white"
            : "text-neutral-600 hover:text-secondary",
        )}
        aria-pressed={value === "map"}
      >
        <MapIcon className="h-3.5 w-3.5" />
        Carte
      </button>
    </div>
  );
}

// ─── Sort select dédié (HeroUI) ────────────────────────────────────────────
function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-neutral-500 text-xs uppercase tracking-wider">
        Trier
      </label>
      <Select
        aria-label="Trier"
        placeholder="Plus récents"
        selectedKey={value || "recent"}
        onSelectionChange={(k) => onChange(String(k))}
        className="w-44"
      >
        <Select.Trigger className="w-full flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-stone-200 hover:border-stone-300 text-sm transition-colors data-[hovered=true]:border-stone-300">
          <ArrowDownUp className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-800" />
          <Select.Indicator className="text-neutral-400" />
        </Select.Trigger>
        <Select.Popover className="overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[200px]">
          <ListBox>
            {SORT_OPTIONS.map((opt) => (
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
  );
}

// ─── Barre de filtres principale (HeroUI Selects) ──────────────────────────
export const PropertySearchBar = ({
  filters,
  setFilters,
  types,
  services,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  types: RefItem[];
  services: RefItem[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localQ, setLocalQ] = React.useState(filters.q);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  React.useEffect(() => {
    const sp: Filters = {
      q: searchParams.get("q") ?? "",
      type: searchParams.get("type") ?? "",
      service: searchParams.get("service") ?? "",
      location: searchParams.get("location") ?? "",
      priceMin: searchParams.get("priceMin") ?? "",
      priceMax: searchParams.get("priceMax") ?? "",
      chambres: searchParams.get("chambres") ?? "",
      sort: searchParams.get("sort") ?? "",
    };
    const hasChange = (Object.keys(sp) as (keyof Filters)[]).some(
      (k) => sp[k] !== filters[k],
    );
    if (hasChange) {
      setFilters(sp);
      setLocalQ(sp.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function syncUrl(next: Filters) {
    const params = new URLSearchParams();
    (Object.keys(next) as (keyof Filters)[]).forEach((k) => {
      if (next[k]) params.set(k, next[k]);
    });
    const qs = params.toString();
    router.replace(qs ? `/properties?${qs}` : "/properties", { scroll: false });
  }

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    syncUrl(next);
  }

  function onSearchSubmit() {
    update({ q: localQ });
  }

  function handleReset() {
    setLocalQ("");
    setFilters(EMPTY_FILTERS);
    router.replace("/properties", { scroll: false });
  }

  const advancedActive = !!(
    filters.priceMin ||
    filters.priceMax ||
    filters.chambres
  );

  const hasActive = !!(
    filters.q ||
    filters.location ||
    filters.type ||
    filters.service ||
    advancedActive ||
    filters.sort
  );

  return (
    <div className="px-6 max-w-screen-xl mx-auto">
      <Motion variant="verticalSlideIn">
        <div className="relative -top-40 bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden">
          {/* Ligne principale : 4 colonnes uniformes avec le hero */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_auto] gap-1 p-2 items-stretch">
            {/* Localisation (HeroUI Select avec sections par commune) */}
            <div className="lg:border-r lg:border-stone-200/80 px-1">
              <Select
                aria-label="Localisation"
                placeholder="Toute la ville"
                selectedKey={filters.location || null}
                onSelectionChange={(k) => update({ location: k ? String(k) : "" })}
                className="w-full"
              >
                <HeroLabel className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3 pt-2 pb-0.5">
                  Localisation
                </HeroLabel>
                <Select.Trigger className="w-full flex items-center gap-3 px-3 pb-2 hover:bg-neutral-50 rounded-xl transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[hovered=true]:bg-neutral-50">
                  <MapPin
                    className={`h-4 w-4 shrink-0 ${
                      filters.location ? "text-primary" : "text-neutral-400"
                    }`}
                  />
                  <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 truncate data-[placeholder]:text-neutral-400" />
                  <Select.Indicator className="text-neutral-400 data-[open=true]:text-primary transition-colors" />
                </Select.Trigger>
                <Select.Popover className="max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[280px] z-[200]">
                  <ListBox>
                    {Object.entries(LOCATIONS_BY_COMMUNE).map(
                      ([commune, items], idx) => (
                        <React.Fragment key={commune}>
                          {idx > 0 && (
                            <Separator className="my-1 bg-stone-100" />
                          )}
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
            <div className="lg:border-r lg:border-stone-200/80 px-1">
              <Select
                aria-label="Type"
                placeholder="Tous les types"
                selectedKey={filters.type || null}
                onSelectionChange={(k) => update({ type: k ? String(k) : "" })}
                className="w-full"
              >
                <HeroLabel className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3 pt-2 pb-0.5">
                  Type
                </HeroLabel>
                <Select.Trigger className="w-full flex items-center gap-3 px-3 pb-2 hover:bg-neutral-50 rounded-xl transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[hovered=true]:bg-neutral-50">
                  <Building2
                    className={`h-4 w-4 shrink-0 ${
                      filters.type ? "text-primary" : "text-neutral-400"
                    }`}
                  />
                  <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 truncate data-[placeholder]:text-neutral-400" />
                  <Select.Indicator className="text-neutral-400 data-[open=true]:text-primary transition-colors" />
                </Select.Trigger>
                <Select.Popover className="max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[220px] z-[200]">
                  <ListBox>
                    {types.map((t) => (
                      <ListBox.Item
                        key={t.id}
                        id={t.name}
                        textValue={t.name}
                        className="px-3 py-2 rounded-lg text-sm text-neutral-800 cursor-pointer flex items-center justify-between data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:font-semibold data-[hovered=true]:bg-stone-100 transition-colors"
                      >
                        {t.name}
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
            <div className="lg:border-r lg:border-stone-200/80 px-1">
              <Select
                aria-label="Service"
                placeholder="Tous les services"
                selectedKey={filters.service || null}
                onSelectionChange={(k) =>
                  update({ service: k ? String(k) : "" })
                }
                className="w-full"
              >
                <HeroLabel className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3 pt-2 pb-0.5">
                  Service
                </HeroLabel>
                <Select.Trigger className="w-full flex items-center gap-3 px-3 pb-2 hover:bg-neutral-50 rounded-xl transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[hovered=true]:bg-neutral-50">
                  <Briefcase
                    className={`h-4 w-4 shrink-0 ${
                      filters.service ? "text-primary" : "text-neutral-400"
                    }`}
                  />
                  <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 truncate data-[placeholder]:text-neutral-400" />
                  <Select.Indicator className="text-neutral-400 data-[open=true]:text-primary transition-colors" />
                </Select.Trigger>
                <Select.Popover className="max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[220px] z-[200]">
                  <ListBox>
                    {services.map((s) => (
                      <ListBox.Item
                        key={s.id}
                        id={s.name}
                        textValue={s.name}
                        className="px-3 py-2 rounded-lg text-sm text-neutral-800 cursor-pointer flex items-center justify-between data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:font-semibold data-[hovered=true]:bg-stone-100 transition-colors"
                      >
                        {s.name}
                        <ListBox.ItemIndicator className="text-primary">
                          ✓
                        </ListBox.ItemIndicator>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* Bouton Rechercher (avec champ texte intégré sur mobile, dropdown sur desktop) */}
            <Button
              type="button"
              onClick={onSearchSubmit}
              className="rounded-xl h-auto px-6 sm:px-8 self-stretch min-h-[64px]"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="sm:inline">Rechercher</span>
            </Button>
          </div>

          {/* Ligne secondaire : champ recherche texte libre + toggle filtres avancés */}
          <div className="border-t border-stone-200/80 px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                size={16}
              />
              <Input
                type="text"
                placeholder="Recherche libre (nom, adresse, mot-clé...)"
                className="pl-10 pr-4 py-2 w-full rounded-full"
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSearchSubmit();
                  }
                }}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced((o) => !o)}
              className={cn(
                "rounded-full px-4 md:px-5 shrink-0 inline-flex items-center gap-1.5",
                (showAdvanced || advancedActive) &&
                  "border-primary text-primary",
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">
                {advancedActive ? "Filtres avancés" : "Plus de filtres"}
              </span>
              {advancedActive && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold">
                  {
                    [
                      filters.priceMin,
                      filters.priceMax,
                      filters.chambres,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>

            {hasActive && (
              <Button
                className="rounded-full px-4 md:px-5 shrink-0"
                onClick={handleReset}
                type="button"
                variant="outline"
                aria-label="Réinitialiser"
                title="Réinitialiser tous les filtres"
              >
                <ResetIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Panneau avancé (Prix min/max + Chambres) */}
          {showAdvanced && (
            <div className="border-t border-stone-200/80 p-5 bg-neutral-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Prix min (FCFA)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    inputMode="numeric"
                    value={filters.priceMin}
                    onChange={(e) => update({ priceMin: e.target.value })}
                    placeholder="Ex : 30 000"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Prix max (FCFA)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    inputMode="numeric"
                    value={filters.priceMax}
                    onChange={(e) => update({ priceMax: e.target.value })}
                    placeholder="Ex : 200 000"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Chambres min
                  </label>
                  <Select
                    aria-label="Chambres min"
                    placeholder="Indifférent"
                    selectedKey={filters.chambres || null}
                    onSelectionChange={(k) =>
                      update({ chambres: k ? String(k) : "" })
                    }
                    className="w-full"
                  >
                    <Select.Trigger className="w-full flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-stone-200 hover:border-stone-300 text-sm transition-colors data-[hovered=true]:border-stone-300 min-h-[40px]">
                      <Select.Value className="flex-1 text-left text-sm font-medium text-neutral-900 data-[placeholder]:text-neutral-400" />
                      <Select.Indicator className="text-neutral-400" />
                    </Select.Trigger>
                    <Select.Popover className="overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 min-w-[200px] z-[200]">
                      <ListBox>
                        {CHAMBRES_OPTIONS.map((opt) => (
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
              </div>

              {advancedActive && (
                <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                  <div className="text-neutral-500">
                    Filtres avancés actifs.
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update({ priceMin: "", priceMax: "", chambres: "" })
                    }
                    className="inline-flex items-center gap-1 text-primary hover:text-secondary font-semibold transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Effacer ces filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Motion>
    </div>
  );
};

function NoPropertyFound() {
  return (
    <div className="container mx-auto flex justify-center items-center">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/images/illustrations/notdata.svg"
          alt="No property found"
          width={100}
          height={100}
        />
        <div className="text-center rounded-lg p-8">
          <h1 className="text-2xl font-bold">Aucune propriété trouvée</h1>
          <p className="text-gray-500">
            Désolé, aucune propriété ne correspond à vos critères de recherche.
          </p>
        </div>
      </div>
    </div>
  );
}
