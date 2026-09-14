"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ArrowDownUp,
  Map as MapIcon,
  List,
} from "lucide-react";
import { PropertiesMap } from "./properties-map";
import HeroSearchBar from "../landing/hero-search-bar";
import { ListBox, Select } from "@heroui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import PropertySection from "./property-section";
import Motion from "../motion";
import { cn } from "@/lib/utils";
import type {
  CatalogueFacettes,
  PublicCommune,
  PublicQuartier,
  TaxonomieEntree,
} from "@/src/actions/public";

/**
 * Ligne de `biens` telle que /properties la reçoit. La table n'a pas de type
 * généré : on liste les colonnes réellement lues ici et par les deux vues
 * enfants (grille et carte), toutes nullables comme en base.
 */
type BienListe = {
  id: string;
  name?: string | null;
  image?: string | null;
  address?: string | null;
  localisation?: string | null;
  ville_commune?: string | null;
  pays?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  commune_id?: string | null;
  quartier_id?: string | null;
  chambre?: number | null;
  salon?: number | null;
  salle_bains?: number | null;
  capacity?: number | null;
  prix?: number | null;
  prix_month?: number | null;
  types_bien?: { id?: number | null; name?: string | null } | null;
  services_bien?: { name?: string | null } | null;
  categories_bien?: { name?: string | null } | null;
};

type Filters = {
  q: string;
  type: string;
  service: string;
  /** slug de commune */
  commune: string;
  /** identifiant de quartier */
  quartier: string;
  priceMin: string;
  priceMax: string;
  chambres: string;
  sort: string;
};

const EMPTY_FILTERS: Filters = {
  q: "",
  type: "",
  service: "",
  commune: "",
  quartier: "",
  priceMin: "",
  priceMax: "",
  chambres: "",
  sort: "",
};

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
 * Listing + filtres /properties.
 *
 * Localisation, type et service sont délégués à HeroSearchBar : deux
 * dropdowns concurrents divergeaient, celui d'ici listant les communes
 * codées en dur alors que la recherche filtre sur celles de la base.
 * Ne restent ici que les filtres avancés (prix, chambres) et le tri.
 */
export default function ListPropertiesSection({
  communes = [],
  quartiers = [],
  initialBiens,
  types,
  services,
  initialFilters,
  facettes,
}: {
  initialBiens: BienListe[];
  types: TaxonomieEntree[];
  services: TaxonomieEntree[];
  initialFilters: Partial<Filters>;
  communes?: PublicCommune[];
  quartiers?: PublicQuartier[];
  facettes?: CatalogueFacettes;
}) {


  const [filters, setFilters] = React.useState<Filters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [viewMode, setViewMode] = React.useState<"list" | "map">("list");

  const filteredBiens = React.useMemo(() => {
    // Normalize string helper
    const normalize = (str: string | undefined | null) => 
      (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let list = initialBiens.filter((bien) => {
      if (filters.q) {
        const q = normalize(filters.q);
        const haystack = normalize([
          bien.name,
          bien.address,
          bien.ville_commune,
          bien.pays,
        ].filter(Boolean).join(" "));
        if (!haystack.includes(q)) return false;
      }
      
      // Localisation : on s'appuie sur les clés étrangères du bien. Un bien
      // enregistré avant la migration 0015 ne les a pas encore : on retombe
      // alors sur son adresse texte, sinon il disparaîtrait du catalogue.
      if (filters.quartier) {
        const q = (quartiers || []).find((x) => x.id === filters.quartier);
        if (bien.quartier_id) {
          if (bien.quartier_id !== filters.quartier) return false;
        } else {
          const label = normalize(q?.name);
          const hay = normalize(
            [bien.address, bien.ville_commune].filter(Boolean).join(" "),
          );
          if (!label || !hay.includes(label)) return false;
        }
      } else if (filters.commune) {
        const c = (communes || []).find((x) => x.slug === filters.commune);
        if (!c) return false;
        if (bien.commune_id) {
          if (bien.commune_id !== c.id) return false;
        } else {
          const label = normalize(c.nom);
          const hay = normalize(
            [bien.address, bien.ville_commune].filter(Boolean).join(" "),
          );
          if (!hay.includes(label)) return false;
        }
      }
      
      // NB : la comparaison bidirectionnelle d'origine acceptait tout bien
      // dont le champ était vide — `"villa".includes("")` vaut true, si bien
      // qu'un bien sans type franchissait chaque filtre de type.
      // Égalité stricte sur le libellé normalisé : les deux côtés viennent de
      // types_bien / services_bien. La comparaison par sous-chaîne d'origine
      // acceptait tout bien dont le champ était vide (`"villa".includes("")`),
      // et faisait remonter un bien « Location » sous le filtre
      // « Location meublée ».
      if (filters.type) {
        const t = normalize(filters.type);
        const name = normalize(bien.types_bien?.name);
        if (!name || name !== t) return false;
      }

      if (filters.service) {
        const svc = normalize(filters.service).replace(/_/g, " ");
        const name = normalize(bien.services_bien?.name);
        if (!name || name !== svc) return false;
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
    // communes/quartiers servent à résoudre le filtre de lieu : les omettre
    // fige le résultat sur la première valeur reçue.
  }, [initialBiens, filters, communes, quartiers]);

  return (
    <section
      id="hero"
      className="relative isolate bg-[#FAF5EE] pt-0 pb-32 mx-auto max-w-screen-2xl"
    >
      <PropertySearchBar
        filters={filters}
        setFilters={setFilters}
        types={types}
        services={services}
        communes={communes}
        quartiers={quartiers}
        facettes={facettes}
      />
      {filteredBiens.length > 0 ? (
        <>
          <div className="px-6 mt-12 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-screen-xl mx-auto">
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
  communes,
  quartiers,
  facettes,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  types: TaxonomieEntree[];
  services: TaxonomieEntree[];
  communes: PublicCommune[];
  quartiers: PublicQuartier[];
  facettes?: CatalogueFacettes;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  React.useEffect(() => {
    let sp: Filters = {
      q: searchParams.get("q") ?? "",
      type: searchParams.get("type") ?? "",
      service: searchParams.get("service") ?? "",
      commune: searchParams.get("commune") ?? "",
      quartier: searchParams.get("quartier") ?? "",
      priceMin: searchParams.get("priceMin") ?? "",
      priceMax: searchParams.get("priceMax") ?? "",
      chambres: searchParams.get("chambres") ?? "",
      sort: searchParams.get("sort") ?? "",
    };

    // Les alias historiques ?location= / ?loc= sont résolus côté serveur et
    // servent d'état initial. Relire les paramètres bruts ici remettait
    // commune/quartier à vide dès le premier rendu et annulait cette
    // résolution : le visiteur venu d'un vieux lien recevait le catalogue
    // entier. On applique donc la même équivalence, à l'identique de
    // app/(marketing)/properties/page.tsx.
    const alias = searchParams.get("location") || searchParams.get("loc") || "";
    if (alias && !sp.commune && !sp.quartier) {
      const norm = (v: unknown) =>
        String(v ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase();
      const l = norm(alias);
      const q = (quartiers || []).find(
        (x) => norm(x.name) === l || norm(x.search_query) === l,
      );
      if (q) {
        sp = { ...sp, quartier: String(q.id) };
      } else {
        const c = (communes || []).find(
          (x) => norm(x.nom) === l || norm(x.slug) === l,
        );
        if (c) sp = { ...sp, commune: String(c.slug) };
      }
    }

    const hasChange = (Object.keys(sp) as (keyof Filters)[]).some(
      (k) => sp[k] !== filters[k],
    );
    if (hasChange) {
      setFilters(sp);
    }
    // Effet volontairement piloté par la seule URL : ajouter `filters` aux
    // dépendances le relancerait à chaque saisie et écraserait les filtres en
    // cours avec ceux de l'URL. `communes` / `quartiers` sont des props stables
    // pour la durée de la page.
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

  function handleReset() {
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
    filters.commune ||
    filters.quartier ||
    filters.type ||
    filters.service ||
    advancedActive ||
    filters.sort
  );

  return (
    <div className="px-6 max-w-screen-xl mx-auto">
      <Motion variant="verticalSlideIn">
        <div>
        <div className="-mt-24 sm:-mt-28 max-w-[1050px] mx-auto z-40 relative px-4 md:px-0">
          <HeroSearchBar 
            communes={communes} 
            quartiers={quartiers} 
            types={types} 
            services={services} 
            facettes={facettes}
          >
            <div className="hidden md:flex items-center gap-2 border-l border-stone-200/60 pl-2 ml-2">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced((o) => !o)}
                className={cn(
                  "rounded-full px-4 h-12 shadow-none border-0 hover:bg-stone-200/50 transition-colors text-stone-500 hover:text-stone-800",
                  (showAdvanced || advancedActive) && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                )}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {advancedActive ? "Filtres avancés" : "Plus de filtres"}
                {advancedActive && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold">
                    {[filters.priceMin, filters.priceMax, filters.chambres].filter(Boolean).length}
                  </span>
                )}
              </Button>
              {hasActive && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="rounded-full h-12 px-3 shadow-none border-0 hover:bg-red-50 hover:text-red-600 transition-colors text-stone-500"
                  aria-label="Réinitialiser"
                  title="Réinitialiser tous les filtres"
                >
                  <ResetIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </HeroSearchBar>
          
          {/* Mobile version of the buttons */}
          <div className="mt-4 flex md:hidden items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced((o) => !o)}
              className={cn(
                "rounded-full px-5 h-10 shadow-sm bg-white border border-stone-200 hover:bg-neutral-50 transition-colors",
                (showAdvanced || advancedActive) && "border-primary text-primary"
              )}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {advancedActive ? "Filtres avancés" : "Plus de filtres"}
              {advancedActive && (
                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold">
                  {[filters.priceMin, filters.priceMax, filters.chambres].filter(Boolean).length}
                </span>
              )}
            </Button>
            {hasActive && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-full h-10 px-4 shadow-sm bg-white border border-stone-200 hover:bg-neutral-50 transition-colors text-neutral-600"
                aria-label="Réinitialiser"
                title="Réinitialiser tous les filtres"
              >
                <ResetIcon className="w-4 h-4 mr-2" />
                Effacer
              </Button>
            )}
          </div>
        </div>
        
        {/* Panneau avancé (Prix min/max + Chambres) */}
          {showAdvanced && (
            <div className="max-w-[1050px] mx-auto mt-4 mx-4 md:mx-auto rounded-2xl border border-stone-200/80 p-5 bg-white shadow-xl relative z-30">
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
