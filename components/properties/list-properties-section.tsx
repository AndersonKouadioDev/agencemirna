"use client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertySection from "./property-section";
import Motion from "../motion";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

const SORT_OPTIONS = [
  { value: "", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Nom A-Z" },
];

/**
 * Composant client de listing + filtrage des biens.
 * - Filtres : recherche libre, type, service, prix min/max, chambres min, tri
 * - Lit/écrit les URL params (q, type, service, location, priceMin, priceMax, chambres, sort)
 * - Panneau avancé (Plus de filtres) repliable pour ne pas surcharger
 * - Compteur résultats + bouton reset
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
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });

  const filteredBiens = useMemo(() => {
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
        if (
          bien.types_bien.name.toLowerCase() !== filters.type.toLowerCase()
        )
          return false;
      }
      if (filters.service && bien.services_bien?.name) {
        const svc = filters.service.toLowerCase().trim();
        const name = bien.services_bien.name.toLowerCase();
        if (!name.includes(svc) && !svc.includes(name)) return false;
      }
      // Prix min/max : on prend le prix le plus pertinent (prix ou prix_month)
      const priceMin = filters.priceMin ? parseInt(filters.priceMin, 10) : null;
      const priceMax = filters.priceMax ? parseInt(filters.priceMax, 10) : null;
      if (priceMin !== null || priceMax !== null) {
        const p = bien.prix ?? bien.prix_month ?? null;
        if (p === null) return false;
        if (priceMin !== null && p < priceMin) return false;
        if (priceMax !== null && p > priceMax) return false;
      }
      // Chambres min
      const chMin = filters.chambres ? parseInt(filters.chambres, 10) : null;
      if (chMin !== null && (bien.chambre ?? 0) < chMin) return false;
      return true;
    });

    // Tri
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
            <div className="flex items-center gap-2 text-sm">
              <label className="text-neutral-500 text-xs uppercase tracking-wider">
                Trier
              </label>
              <Select
                value={filters.sort || "recent"}
                onValueChange={(v) =>
                  setFilters({ ...filters, sort: v === "recent" ? "" : v })
                }
              >
                <SelectTrigger className="w-44 rounded-full border-stone-200 bg-white">
                  <SelectValue placeholder="Plus récents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  <SelectItem value="name_asc">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <PropertySection biens={filteredBiens} />
        </>
      ) : (
        <NoPropertyFound />
      )}
    </section>
  );
}

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
  const [localQ, setLocalQ] = useState(filters.q);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync URL -> filters (back/forward browser nav)
  useEffect(() => {
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
        <div className="relative -top-40 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Ligne principale */}
          <div className="flex items-center flex-col lg:flex-row gap-4 justify-between p-6 lg:p-4 space-x-0 lg:space-x-2">
            <div className="flex items-center gap-2 w-full lg:w-2/5">
              <div className="relative flex-grow">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Rechercher (nom, ville, quartier...)"
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
                className="rounded-full px-6 shrink-0"
                onClick={onSearchSubmit}
                type="button"
              >
                Rechercher
              </Button>
            </div>

            <div className="flex-1 gap-3 w-full flex sm:flex-row flex-col justify-end items-center">
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  update({ type: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full rounded-full border-none bg-gray-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.service || "all"}
                onValueChange={(value) =>
                  update({ service: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full rounded-full border-none bg-gray-100">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                  {advancedActive ? "Filtres avancés ·" : "Plus de filtres"}
                </span>
                {advancedActive && (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold">
                    {
                      [filters.priceMin, filters.priceMax, filters.chambres].filter(
                        Boolean,
                      ).length
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
          </div>

          {/* Panneau avancé */}
          {showAdvanced && (
            <div className="border-t border-stone-200 p-6 lg:p-5 bg-gray-50">
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
                    placeholder="Ex: 30 000"
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
                    placeholder="Ex: 200 000"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Chambres min
                  </label>
                  <Select
                    value={filters.chambres || "any"}
                    onValueChange={(v) =>
                      update({ chambres: v === "any" ? "" : v })
                    }
                  >
                    <SelectTrigger className="rounded-full bg-white">
                      <SelectValue placeholder="Indifférent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Indifférent</SelectItem>
                      <SelectItem value="1">1+ chambre</SelectItem>
                      <SelectItem value="2">2+ chambres</SelectItem>
                      <SelectItem value="3">3+ chambres</SelectItem>
                      <SelectItem value="4">4+ chambres</SelectItem>
                      <SelectItem value="5">5+ chambres</SelectItem>
                    </SelectContent>
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
