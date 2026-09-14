"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Building2, Briefcase, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ABIDJAN_LOCATIONS,
  BIEN_TYPES,
  BIEN_SERVICES,
} from "@/lib/constants/properties";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const FALLBACK_LOCATIONS_BY_COMMUNE = ABIDJAN_LOCATIONS.reduce(
  (acc, loc) => {
    if (!acc[loc.group]) acc[loc.group] = [];
    acc[loc.group].push(loc);
    return acc;
  },
  {} as Record<string, typeof ABIDJAN_LOCATIONS>,
);

export default function HeroSearchBar({ 
  onSearch, 
  communes = [], 
  quartiers = [], 
  types = [], 
  services = [],
  facettes,
  children
}: { 
  onSearch?: (params: URLSearchParams) => void;
  communes?: any[];
  quartiers?: any[];
  types?: any[];
  services?: any[];
  /** Nombre de biens actifs par entrée, pour n'offrir que des filtres qui
   *  donnent un résultat. Absent : tout est proposé. */
  facettes?: {
    types: Record<string, number>;
    services: Record<string, number>;
    communes: Record<string, number>;
    quartiers: Record<string, number>;
    disponible: boolean;
  };
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Valeur encodée « commune:<slug> » ou « quartier:<id> ».
  const readLocation = React.useCallback(() => {
    const q = searchParams.get("quartier");
    if (q) return `quartier:${q}`;
    const c = searchParams.get("commune");
    if (c) return `commune:${c}`;

    // Alias historiques ?location= / ?loc= : /properties les résout pour
    // filtrer la liste, mais la barre les ignorait. Elle affichait « Où ? »
    // sur un catalogue pourtant filtré, puis `construireParams` effaçait
    // l'alias à la soumission suivante — le lieu disparaissait sans un mot.
    const alias = searchParams.get("location") || searchParams.get("loc");
    if (alias) {
      const norm = (v: unknown) =>
        String(v ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase();
      const l = norm(alias);
      const quartier = quartiers.find(
        (x: any) => norm(x.name) === l || norm(x.search_query) === l,
      );
      if (quartier) return `quartier:${quartier.id}`;
      const commune = communes.find(
        (x: any) => norm(x.nom) === l || norm(x.slug) === l,
      );
      if (commune) return `commune:${commune.slug}`;
    }
    return null;
  }, [searchParams, communes, quartiers]);

  const [location, setLocation] = React.useState<string | null>(readLocation);
  const [type, setType] = React.useState<string | null>(searchParams.get("type") || null);
  const [service, setService] = React.useState<string | null>(searchParams.get("service") || null);

  const [activeTab, setActiveTab] = React.useState<"location" | "type" | "service" | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Synchronisation inconditionnelle : les gardes `if (x)` d'origine
  // empêchaient la remise à zéro, si bien que « Réinitialiser » vidait l'URL
  // mais laissait la barre afficher — et réappliquer — les anciens critères.
  React.useEffect(() => {
    setLocation(readLocation());
    setType(searchParams.get("type"));
    setService(searchParams.get("service"));
  }, [searchParams, readLocation]);


  /**
   * Localisations proposées, groupées par commune.
   *
   * Ne sont offertes que les communes portant au moins un bien : la table en
   * compte 13, cinq seulement sont utilisées — les huit autres menaient à un
   * résultat vide sans que le visiteur puisse comprendre pourquoi.
   */
  const groupesLocalisation = React.useMemo(() => {
    if (communes.length === 0) {
      return Object.entries(FALLBACK_LOCATIONS_BY_COMMUNE).map(([nom, items]) => ({
        nom,
        value: null as string | null,
        total: 0,
        quartiers: (items as any[]).map((i) => ({
          value: i.value,
          label: i.label,
          total: 0,
        })),
      }));
    }

    const compte = (bucket: Record<string, number> | undefined, k: string) =>
      facettes?.disponible ? (bucket?.[k] ?? 0) : -1; // -1 : comptage indisponible

    return communes
      .map((c) => ({
        nom: c.nom as string,
        value: `commune:${c.slug}` as string | null,
        total: compte(facettes?.communes, c.id),
        quartiers: quartiers
          .filter(
            (q) =>
              q.commune_id === c.id ||
              (q.commune && q.commune.toLowerCase() === String(c.nom).toLowerCase()),
          )
          .map((q) => ({
            value: `quartier:${q.id}`,
            label: q.name as string,
            total: compte(facettes?.quartiers, q.id),
          })),
      }))
      // Une commune est proposée si elle porte des biens, ou si l'un de ses
      // quartiers en porte. Les quartiers à zéro restent affichés — ils disent
      // au visiteur comment le catalogue est découpé — mais sont désactivés
      // au rendu plutôt que de mener à une page vide.
      .filter(
        (g) => g.total !== 0 || g.quartiers.some((q) => q.total !== 0),
      );
  }, [communes, quartiers, facettes]);

  /** Toutes les options à plat, pour retrouver un libellé depuis une valeur. */
  const optionsLocalisation = React.useMemo(
    () =>
      groupesLocalisation.flatMap((g) => [
        ...(g.value ? [{ value: g.value, label: g.nom }] : []),
        ...g.quartiers
          .filter((q) => q.total !== 0)
          .map((q) => ({ value: q.value, label: q.label })),
      ]),
    [groupesLocalisation],
  );

  // Même règle pour le type et le service : on n'affiche pas une option qui
  // ne renverrait aucun bien.
  const utiles = (liste: any[], bucket?: Record<string, number>) =>
    facettes?.disponible && bucket
      ? liste.filter((x) => (bucket[String(x.id)] ?? 0) > 0)
      : liste;

  const dynamicTYPES: { value: string; label: string }[] =
    types && types.length > 0
      ? utiles(types, facettes?.types).map((t) => ({ value: t.name, label: t.name }))
      : BIEN_TYPES;
  const dynamicSERVICES: { value: string; label: string }[] =
    services && services.length > 0
      ? utiles(services, facettes?.services).map((s) => ({ value: s.name, label: s.name }))
      : BIEN_SERVICES;


  // Don't auto open by default unless you want it, but the user is complaining it stays open.
  // Actually if we want to close it externally from hero-section, we need a way to pass activeTab from the parent.
  // For now, let's just make it not auto-open on mount.

  useOnClickOutside(containerRef, () => setActiveTab(null));

  /**
   * Construit les paramètres d'une recherche.
   *
   * Unique pour les trois chemins de soumission : chacun refaisait ce travail
   * de son côté et deux d'entre eux perdaient le lieu. Deux invariants s'y
   * jouent. On repart des paramètres existants, sinon prix min/max, chambres
   * et tri sont effacés à chaque recherche. Et le préfixe de l'état interne
   * (« commune:<slug> », « quartier:<id> ») est décodé ici : émis tel quel
   * sous ?location=, ni /properties ni la modale de l'accueil ne savent le
   * relire, et le critère de lieu disparaît sans un message d'erreur.
   */
  function construireParams(
    lieu: string | null,
    typeChoisi: string | null,
    serviceChoisi: string | null,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    ["location", "loc", "commune", "quartier"].forEach((k) => params.delete(k));

    if (lieu) {
      const [kind, id] = lieu.split(":");
      if (kind === "quartier" || kind === "commune") params.set(kind, id);
      else params.set("commune", lieu);
    }

    const tLabel = typeChoisi
      ? dynamicTYPES.find((t) => t.value === typeChoisi)?.label
      : undefined;
    if (tLabel) params.set("type", tLabel);
    else params.delete("type");

    const sLabel = serviceChoisi
      ? dynamicSERVICES.find((s) => s.value === serviceChoisi)?.label
      : undefined;
    if (sLabel) params.set("service", sLabel);
    else params.delete("service");

    return params;
  }

  /** Le parent filtre sur place s'il fournit `onSearch` ; sinon on navigue. */
  function soumettre(params: URLSearchParams) {
    if (onSearch) {
      onSearch(params);
      return;
    }

    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setActiveTab(null);
    soumettre(construireParams(location, type, service));
  }

  const getLocationLabel = () => {
    if (!location) return "Où ?";
    // Cherché dans les options réellement affichées : l'ancienne version
    // interrogeait la liste statique, si bien que le libellé restait bloqué
    // sur « Où ? » dès que les communes venaient de la base.
    return optionsLocalisation.find((l) => l.value === location)?.label ?? "Où ?";
  };

  const getTypeLabel = () => {
    if (!type) return "Quel type ?";
    const t = dynamicTYPES.find((x) => x.value === type);
    return t ? t.label : "Quel type ?";
  };

  const getServiceLabel = () => {
    if (!service) return "Quel projet ?";
    const s = dynamicSERVICES.find((x) => x.value === service);
    return s ? s.label : "Quel projet ?";
  };

  // Progress logic
  let progress = 0;
  if (activeTab === "location") progress = 33;
  if (activeTab === "type") progress = 66;
  if (activeTab === "service") progress = 100;

  return (
    <div className={cn("relative w-full mx-auto", children ? "max-w-[1050px]" : "max-w-[850px]")} ref={containerRef}>
      {/* TRIGGER BAR */}
      <form
        onSubmit={onSubmit}
        className="bg-stone-100/90 backdrop-blur-xl border border-stone-200/60 rounded-3xl md:rounded-full flex flex-col md:flex-row items-stretch md:items-center justify-between p-2 shadow-xl relative z-30"
      >
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 w-full relative">
          {/* Tab 1: Localisation */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "location" ? null : "location")}
            className={cn(
              "px-4 py-3 rounded-full text-left transition-all duration-300 flex items-center gap-4 relative z-10",
              activeTab === "location" ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02]" : "hover:bg-stone-200/50"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-full transition-colors",
              activeTab === "location" || location ? "bg-primary/10 text-primary" : "bg-stone-200 text-stone-500"
            )}>
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">Localisation</span>
              <span className={cn("font-medium text-[15px] truncate max-w-[130px] block", location ? "text-secondary font-extrabold" : "text-stone-400")}>
                {getLocationLabel()}
              </span>
            </div>
          </button>

          {/* Separator 1 */}
          <div className="hidden md:block absolute left-1/3 top-1/2 -translate-y-1/2 w-px h-8 bg-stone-300 z-0" />

          {/* Tab 2: Type */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "type" ? null : "type")}
            className={cn(
              "px-4 py-3 rounded-full text-left transition-all duration-300 flex items-center gap-4 relative z-10",
              activeTab === "type" ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02]" : "hover:bg-stone-200/50"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-full transition-colors",
              activeTab === "type" || type ? "bg-primary/10 text-primary" : "bg-stone-200 text-stone-500"
            )}>
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">Type</span>
              <span className={cn("font-medium text-[15px] truncate max-w-[130px] block", type ? "text-secondary font-extrabold" : "text-stone-400")}>
                {getTypeLabel()}
              </span>
            </div>
          </button>

          {/* Separator 2 */}
          <div className="hidden md:block absolute left-2/3 top-1/2 -translate-y-1/2 w-px h-8 bg-stone-300 z-0" />

          {/* Tab 3: Service */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "service" ? null : "service")}
            className={cn(
              "px-4 py-3 rounded-full text-left transition-all duration-300 flex items-center gap-4 relative z-10",
              activeTab === "service" ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02]" : "hover:bg-stone-200/50"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-full transition-colors",
              activeTab === "service" || service ? "bg-primary/10 text-primary" : "bg-stone-200 text-stone-500"
            )}>
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">Service</span>
              <span className={cn("font-medium text-[15px] truncate max-w-[130px] block", service ? "text-secondary font-extrabold" : "text-stone-400")}>
                {getServiceLabel()}
              </span>
            </div>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-2 md:mt-0 ml-0 md:ml-2">
          {children}
          <button
            type="submit"
            className="w-full md:w-auto bg-primary text-white p-4 md:px-8 md:py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 shrink-0 scale-100 hover:scale-105 z-20"
          >
            <Search className="h-5 w-5" />
            <span className="inline text-[15px]">Rechercher</span>
          </button>
        </div>
      </form>

      {/* SINGLE POPOVER CONTAINER */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-[110%] left-0 w-full bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden z-20 max-h-[50vh] sm:max-h-none flex flex-col"
          >
            {/* PROGRESS BAR */}
            <div className="w-full h-1.5 bg-stone-100 relative shrink-0">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            {/* DYNAMIC CONTENT CONTAINER */}
            <div className="p-6 md:p-8 min-h-[250px] sm:min-h-[350px] relative overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                
                {/* STEP 1 : LOCATION */}
                {activeTab === "location" && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-bold font-agate text-secondary">Où cherchez-vous ?</h3>
                      {location && (
                        <button onClick={() => setLocation(null)} className="text-sm font-bold text-primary underline underline-offset-4">
                          Réinitialiser
                        </button>
                      )}
                    </div>
                    
                    {groupesLocalisation.length === 0 ? (
                      <p className="text-sm text-stone-500">
                        Aucune localisation ne correspond à des biens disponibles
                        pour le moment.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {groupesLocalisation.map((groupe) => {
                          const choisirCommune = () => {
                            if (!groupe.value) return;
                            setLocation(groupe.value);
                            setActiveTab("type");
                          };
                          const communeSelectionnee = location === groupe.value;

                          return (
                            <div key={groupe.nom} className="flex flex-col gap-1.5">
                              {/* La commune est elle-même le choix « toute la
                                  commune » : un en-tête de groupe suivi d'une
                                  seule entrée redisait deux fois la même chose. */}
                              <button
                                onClick={choisirCommune}
                                disabled={!groupe.value}
                                className={cn(
                                  "text-left px-4 py-3 rounded-2xl text-sm transition-all duration-200 border-2 flex items-center justify-between gap-2",
                                  communeSelectionnee
                                    ? "border-primary bg-primary text-white font-bold shadow-md"
                                    : "border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold",
                                )}
                              >
                                <span className="truncate">{groupe.nom}</span>
                                {communeSelectionnee ? (
                                  <Check className="h-4 w-4 text-white shrink-0" />
                                ) : (
                                  groupe.total > 0 && (
                                    <span className="text-xs font-medium text-stone-400 shrink-0">
                                      {groupe.total}
                                    </span>
                                  )
                                )}
                              </button>

                              {groupe.quartiers.length > 0 && (
                                <div className="flex flex-col gap-1 pl-3 border-l-2 border-stone-100 ml-4">
                                  {groupe.quartiers.map((q) => {
                                    const selectionne = location === q.value;
                                    // Un quartier sans bien reste listé pour
                                    // montrer le découpage, mais n'est pas
                                    // cliquable : le filtre ne renverrait rien.
                                    const vide = q.total === 0;
                                    return (
                                      <button
                                        key={q.value}
                                        type="button"
                                        disabled={vide}
                                        title={
                                          vide
                                            ? `Aucun bien disponible à ${q.label} pour le moment`
                                            : undefined
                                        }
                                        onClick={() => {
                                          setLocation(q.value);
                                          setActiveTab("type");
                                        }}
                                        className={cn(
                                          "text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 flex items-center justify-between gap-2",
                                          selectionne
                                            ? "bg-primary text-white font-semibold"
                                            : vide
                                              ? "text-stone-300 cursor-not-allowed"
                                              : "hover:bg-stone-50 text-stone-500",
                                        )}
                                      >
                                        <span className="truncate">{q.label}</span>
                                        {selectionne ? (
                                          <Check className="h-3.5 w-3.5 text-white shrink-0" />
                                        ) : (
                                          <span className="text-xs text-stone-400 shrink-0">
                                            {q.total > 0 ? q.total : "—"}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2 : TYPE */}
                {activeTab === "type" && (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-bold font-agate text-secondary">Quel type de bien ?</h3>
                      {type && (
                        <button onClick={() => setType(null)} className="text-sm font-bold text-primary underline underline-offset-4">
                          Réinitialiser
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {dynamicTYPES.filter((t) => t.value).map((opt) => {
                        const isSelected = type === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setType(opt.value);
                              setActiveTab("service");
                            }}
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 border-2 gap-4",
                              isSelected
                                ? "border-primary bg-primary text-white shadow-lg scale-105"
                                : "border-stone-100 bg-white hover:border-primary/40 hover:bg-stone-50 text-stone-600"
                            )}
                          >
                            <Building2 className={cn("h-8 w-8", isSelected ? "text-white" : "text-stone-400")} />
                            <span className="font-bold text-sm text-center">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 : SERVICE */}
                {activeTab === "service" && (
                  <motion.div
                    key="service"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-bold font-agate text-secondary">Quel est votre projet ?</h3>
                      {service && (
                        <button onClick={() => setService(null)} className="text-sm font-bold text-primary underline underline-offset-4">
                          Réinitialiser
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dynamicSERVICES.filter((s) => s.value).map((opt) => {
                        const isSelected = service === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setService(opt.value);
                              setActiveTab(null); // On ferme
                              
                              // Auto submit après un court délai pour laisser voir la sélection.
                              // `service` porte encore la valeur précédente dans
                              // cette frame : on passe opt.value directement.
                              setTimeout(() => {
                                soumettre(construireParams(location, type, opt.value));
                              }, 300);
                            }}
                            className={cn(
                              "flex items-center p-4 md:p-6 rounded-3xl transition-all duration-300 border-2 gap-4 md:gap-6 text-left",
                              isSelected
                                ? "border-primary bg-primary text-white shadow-lg"
                                : "border-stone-100 bg-white hover:border-primary/40 hover:bg-stone-50 text-stone-600"
                            )}
                          >
                            <div className={cn("p-4 rounded-full", isSelected ? "bg-white/20" : "bg-stone-100")}>
                              <Briefcase className={cn("h-6 w-6", isSelected ? "text-white" : "text-stone-500")} />
                            </div>
                            <div>
                              <span className="font-bold text-lg block mb-1">{opt.label}</span>
                              <span className={cn("text-sm", isSelected ? "text-white/80" : "text-stone-400")}>
                                Sélectionnez pour voir les biens
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
