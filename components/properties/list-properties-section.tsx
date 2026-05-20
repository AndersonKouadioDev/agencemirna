"use client";
import { Search } from "lucide-react";
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

type RefItem = { id: number; name: string };

type Filters = {
  q: string;
  type: string;
  service: string;
  location: string;
};

/**
 * Composant client de listing + filtrage des biens.
 * - Reçoit les biens + données de référence depuis le Server Component parent
 * - Lit les URL params (q, type, service, location) pour pré-remplir
 * - Filtre côté client avec `includes()` (case-insensitive, résilient au case)
 * - Sync l'URL à chaque changement de filtre (URL = source de vérité partageable)
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
  initialFilters: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const filteredBiens = useMemo(() => {
    return initialBiens.filter((bien: any) => {
      // Filtre texte libre : nom du bien
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
      // Filtre localisation (peut être différent de q pour cibler le quartier)
      if (filters.location) {
        const loc = filters.location.toLowerCase().trim();
        const hay = [bien.address, bien.ville_commune, bien.pays]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(loc)) return false;
      }
      // Filtre type : match exact (insensible à la casse)
      if (filters.type && bien.types_bien?.name) {
        if (
          bien.types_bien.name.toLowerCase() !== filters.type.toLowerCase()
        )
          return false;
      }
      // Filtre service : `includes` pour être robuste aux libellés DB
      // (ex: dropdown "Location meublée courte durée" matche aussi "location" venant du hero)
      if (filters.service && bien.services_bien?.name) {
        const svc = filters.service.toLowerCase().trim();
        const name = bien.services_bien.name.toLowerCase();
        if (!name.includes(svc) && !svc.includes(name)) return false;
      }
      return true;
    });
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
          <div className="px-6 mb-6 text-sm text-neutral-600">
            <span className="font-semibold text-secondary">
              {filteredBiens.length}
            </span>{" "}
            bien{filteredBiens.length > 1 ? "s" : ""} trouvé
            {filteredBiens.length > 1 ? "s" : ""}
            {filters.q || filters.type || filters.service || filters.location
              ? " · "
              : null}
            {filters.q && (
              <span className="italic">recherche « {filters.q} »</span>
            )}
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

  // Sync URL params -> filters (back/forward browser nav)
  useEffect(() => {
    const sp = {
      q: searchParams.get("q") ?? "",
      type: searchParams.get("type") ?? "",
      service: searchParams.get("service") ?? "",
      location: searchParams.get("location") ?? "",
    };
    if (
      sp.q !== filters.q ||
      sp.type !== filters.type ||
      sp.service !== filters.service ||
      sp.location !== filters.location
    ) {
      setFilters(sp);
      setLocalQ(sp.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function syncUrl(next: Filters) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.type) params.set("type", next.type);
    if (next.service) params.set("service", next.service);
    if (next.location) params.set("location", next.location);
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
    setFilters({ q: "", type: "", service: "", location: "" });
    router.replace("/properties", { scroll: false });
  }

  const hasActive = !!(
    filters.q ||
    filters.location ||
    filters.type ||
    filters.service
  );

  return (
    <div className="px-6">
      <Motion variant="verticalSlideIn">
        <div className="flex items-center lg:flex-row flex-col gap-4 justify-between z-10 bg-white relative -top-40 w-full mx-auto max-w-screen-lg space-x-2 px-8 md:px-16 py-8 lg:py-4 rounded-xl lg:rounded-full shadow-lg">
          <div className="flex items-center space-x-2 w-full lg:w-2/5">
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
              className="rounded-full px-6"
              onClick={onSearchSubmit}
              type="button"
            >
              Rechercher
            </Button>
          </div>
          <div className="flex-1 gap-4 w-full flex sm:flex-row flex-col justify-end items-center space-x-2">
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
            {hasActive && (
              <Button
                className="rounded-full px-4 md:px-6"
                onClick={handleReset}
                type="button"
              >
                <ResetIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
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
        <div className="text-center  rounded-lg p-8">
          <h1 className="text-2xl font-bold">Aucune propriété trouvée</h1>
          <p className="text-gray-500">
            Désolé, aucune propriété ne correspond à vos critères de recherche.
          </p>
        </div>
      </div>
    </div>
  );
}
