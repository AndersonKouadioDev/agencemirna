"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Building2, Briefcase, Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ABIDJAN_LOCATIONS,
  BIEN_TYPES,
  BIEN_SERVICES,
} from "@/lib/constants/properties";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const LOCATIONS_BY_COMMUNE = ABIDJAN_LOCATIONS.reduce(
  (acc, loc) => {
    if (!acc[loc.group]) acc[loc.group] = [];
    acc[loc.group].push(loc);
    return acc;
  },
  {} as Record<string, typeof ABIDJAN_LOCATIONS>,
);

export default function HeroSearchBar({ onSearch }: { onSearch?: (params: URLSearchParams) => void }) {
  const router = useRouter();
  const [location, setLocation] = React.useState<string | null>(null);
  const [type, setType] = React.useState<string | null>(null);
  const [service, setService] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<"location" | "type" | "service" | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Don't auto open by default unless you want it, but the user is complaining it stays open.
  // Actually if we want to close it externally from hero-section, we need a way to pass activeTab from the parent.
  // For now, let's just make it not auto-open on mount.

  useOnClickOutside(containerRef, () => setActiveTab(null));

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setActiveTab(null);
    const params = new URLSearchParams();
    
    // Correct URL parameter mapping for ListPropertiesSection compatibility
    if (location) params.set("location", location); // use location instead of q
    if (type) {
      const tLabel = BIEN_TYPES.find(t => t.value === type)?.label;
      if (tLabel) params.set("type", tLabel);
    }
    if (service) {
      const sLabel = BIEN_SERVICES.find(s => s.value === service)?.label;
      if (sLabel) params.set("service", sLabel);
    }
    
    if (onSearch) {
      // In modal search context, we can just pass the params
      onSearch(params);
      return;
    }

    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  const getLocationLabel = () => {
    if (!location) return "Où ?";
    const loc = ABIDJAN_LOCATIONS.find((l) => l.value === location);
    return loc ? loc.label : "Où ?";
  };

  const getTypeLabel = () => {
    if (!type) return "Quel type ?";
    const t = BIEN_TYPES.find((x) => x.value === type);
    return t ? t.label : "Quel type ?";
  };

  const getServiceLabel = () => {
    if (!service) return "Quel projet ?";
    const s = BIEN_SERVICES.find((x) => x.value === service);
    return s ? s.label : "Quel projet ?";
  };

  // Progress logic
  let progress = 0;
  if (activeTab === "location") progress = 33;
  if (activeTab === "type") progress = 66;
  if (activeTab === "service") progress = 100;

  return (
    <div className="relative w-full max-w-[850px] mx-auto" ref={containerRef}>
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

        <button
          type="submit"
          className="w-full md:w-auto mt-2 md:mt-0 bg-primary text-white p-4 md:px-8 md:py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 ml-0 md:ml-2 shrink-0 scale-100 hover:scale-105 z-20"
        >
          <Search className="h-5 w-5" />
          <span className="inline text-[15px]">Rechercher</span>
        </button>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(LOCATIONS_BY_COMMUNE).map(([commune, items]) => (
                        <div key={commune}>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">{commune}</h4>
                          <div className="flex flex-col gap-2">
                            {items.map((opt) => {
                              const isSelected = location === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => {
                                    setLocation(opt.value);
                                    setActiveTab("type");
                                  }}
                                  className={cn(
                                    "text-left px-4 py-3 rounded-2xl text-sm transition-all duration-200 border-2 flex items-center justify-between",
                                    isSelected
                                      ? "border-primary bg-primary text-white font-bold shadow-md"
                                      : "border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-600"
                                  )}
                                >
                                  {opt.label}
                                  {isSelected && <Check className="h-4 w-4 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
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
                      {BIEN_TYPES.filter((t) => t.value).map((opt) => {
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
                      {BIEN_SERVICES.filter((s) => s.value).map((opt) => {
                        const isSelected = service === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setService(opt.value);
                              setActiveTab(null); // On ferme
                              
                              // Auto submit après un court délai pour laisser voir la sélection
                              setTimeout(() => {
                                const params = new URLSearchParams();
                                if (location) params.set("location", location);
                                if (type) {
                                  const tLabel = BIEN_TYPES.find(t => t.value === type)?.label;
                                  if (tLabel) params.set("type", tLabel);
                                }
                                
                                const sLabel = BIEN_SERVICES.find(s => s.value === opt.value)?.label;
                                if (sLabel) params.set("service", sLabel);
                                
                                if (onSearch) {
                                  onSearch(params);
                                } else {
                                  const qs = params.toString();
                                  router.push(qs ? `/properties?${qs}` : "/properties");
                                }
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
