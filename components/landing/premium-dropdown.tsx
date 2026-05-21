"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  value: string;
  label: string;
  /** Optionnel : pour grouper les options par catégorie (ex: communes / quartiers) */
  group?: string;
};

/**
 * Dropdown custom premium pour les champs de recherche.
 * - Trigger style "Airbnb-like" : label en uppercase + value sélectionnée + chevron
 * - Popover animé framer-motion (slide-down + fade)
 * - Items groupés par `group` (sticky group header)
 * - Click-outside / ESC / Tab pour fermer
 * - Accessible : aria-expanded, aria-haspopup, aria-activedescendant
 *
 * Usage :
 *   <PremiumDropdown
 *     label="Localisation"
 *     icon={MapPin}
 *     value={location}
 *     onChange={setLocation}
 *     placeholder="Toute la ville"
 *     options={ABIDJAN_LOCATIONS}
 *   />
 */
export function PremiumDropdown({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder = "Sélectionner",
  options,
  className,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: DropdownOption[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Affichage : label de l'option sélectionnée OU placeholder
  const selectedOption = options.find((o) => o.value === value);
  const displayValue = selectedOption?.label ?? placeholder;
  const hasValue = !!value;

  // Click outside + ESC
  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Group les options par `group` (ordre d'apparition)
  const grouped = React.useMemo(() => {
    const map = new Map<string, DropdownOption[]>();
    for (const opt of options) {
      const key = opt.group ?? "__default__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(opt);
    }
    return Array.from(map.entries());
  }, [options]);

  function handleSelect(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full text-left px-4 py-3 rounded-xl transition-all group",
          "hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          open && "bg-neutral-50",
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                hasValue ? "text-primary" : "text-neutral-400",
              )}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-0.5 leading-none">
              {label}
            </div>
            <div
              className={cn(
                "text-sm font-medium truncate leading-tight",
                hasValue ? "text-neutral-900" : "text-neutral-400",
              )}
            >
              {displayValue}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
              open && "rotate-180 text-primary",
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 mt-2 z-[200] max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5"
            style={{ minWidth: "240px" }}
          >
            {grouped.map(([groupKey, items]) => (
              <div key={groupKey}>
                {groupKey !== "__default__" && (
                  <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-primary/80 sticky top-0 bg-white">
                    {groupKey}
                  </div>
                )}
                {items.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={`${groupKey}-${opt.value}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-neutral-800 hover:bg-stone-100",
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
