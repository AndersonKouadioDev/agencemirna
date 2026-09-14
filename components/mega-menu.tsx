"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MENU_FALLBACK_IMAGE,
  MENU_IMAGES_PAR_ICONE,
  MENU_ICONS,
  type MenuItem,
  type MenuSubItem,
} from "@/config/site";

/**
 * MegaMenu desktop façon Descript :
 * - Trigger = label + chevron qui rotate au hover
 * - Popover plein largeur (mega) ou colonne unique (simple) selon
 *   columns/simpleItems
 * - Featured card à droite si défini
 * - Animation fade + slide-down framer-motion
 * - Click-outside + ESC pour fermer
 * - Open au hover (delay 150ms in/out) ET au focus clavier
 */
export function MegaMenu({
  item,
  onDark = false,
}: {
  item: MenuItem;
  onDark?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Si pas de sous-menu (item simple), juste un Link
  const hasSubmenu = !!(item.columns?.length || item.simpleItems?.length);

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

  function scheduleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (open) return;
    openTimer.current = setTimeout(() => setOpen(true), 100);
  }

  function scheduleClose() {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }

  // Item simple (juste un lien)
  if (!hasSubmenu) {
    return (
      <Link
        href={item.href ?? "#"}
        className={cn(
          "relative px-2 py-2 text-lg font-medium transition-colors group",
          onDark
            ? item.active
              ? "text-white"
              : "text-white/80 hover:text-white"
            : item.active
              ? "text-secondary"
              : "text-neutral-600 hover:text-secondary",
        )}
      >
        {item.label}
        {item.active ? (
          <span className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
        ) : (
          <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        )}
      </Link>
    );
  }

  // Mega menu (multi-colonnes) vs simple dropdown (1 colonne)
  const isMega = !!item.columns?.length;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={scheduleOpen}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative inline-flex items-center gap-1.5 px-2 py-2 text-lg font-medium transition-colors focus:outline-none group",
          onDark
            ? item.active || open
              ? "text-white"
              : "text-white/80 hover:text-white"
            : item.active || open
              ? "text-secondary"
              : "text-neutral-600 hover:text-secondary",
        )}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
        {(item.active || open) ? (
          <span className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
        ) : (
          <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed top-[110px] z-[200] rounded-2xl bg-white border border-stone-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden left-1/2 -translate-x-1/2 origin-top",
              isMega
                ? "w-[min(1150px,calc(100vw-2rem))]"
                : "w-[min(1150px,calc(100vw-2rem))]",
            )}
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
            }}
            onMouseLeave={scheduleClose}
          >
            {isMega ? (
              <MegaContent item={item} onItemClick={() => setOpen(false)} />
            ) : (
              <SimpleContent
                items={item.simpleItems ?? []}
                onItemClick={() => setOpen(false)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mega menu (Interactive Dynamic Split Layout for Columns) ───────────────────────────────
function MegaContent({
  item,
  onItemClick,
}: {
  item: MenuItem;
  onItemClick: () => void;
}) {
  const [hovered, setHovered] = useState<MenuSubItem | null>(null);

  // Le visuel vient de la donnée elle-même (commune.image) :
  // plus aucune correspondance libellé → image en dur, qui laissait les
  // nouvelles communes sans photo.
  const currentImage =
    hovered?.image ||
    (hovered?.icon ? MENU_IMAGES_PAR_ICONE[hovered.icon] : undefined) ||
    MENU_FALLBACK_IMAGE;
  const currentTitle = hovered?.label || item.featured?.title || "Découvrir";
  const currentDesc = hovered
    ? `Découvrez nos offres pour : ${hovered.label}`
    : item.featured?.description;

  const colonnes = item.columns ?? [];

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Left side: Columns */}
      <div className="flex-1 p-4">
        <div
          className="grid gap-8"
          // Trois colonnes : type, service, commune. Calculé plutôt que figé,
          // pour rester juste si une colonne est ajoutée ou retirée.
          style={{
            gridTemplateColumns: `repeat(${Math.max(colonnes.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {colonnes.map((col) => (
            <div key={col.title}>
              <h4
                className={cn(
                  "font-bold uppercase tracking-wider text-secondary mb-6 border-l-4 border-primary pl-4",
                  // Au-delà de 3 colonnes chaque colonne tombe sous ~150 px :
                  // un titre `whitespace-nowrap` déborderait sur sa voisine.
                  colonnes.length > 3
                    ? "text-sm"
                    : "text-base whitespace-nowrap",
                )}
              >
                {col.title}
              </h4>
              <ul className="space-y-4">
                {/*
                  Ni la clé ni le survol ne peuvent reposer sur `href` : quand
                  la base ne répond pas, getMenuList dégrade tous les liens en
                  « /properties ». Les entrées partageaient alors la même clé
                  React et le survol de l'une surlignait toute la colonne. Le
                  libellé identifie l'entrée, l'objet lui-même tranche le survol.
                */}
                {col.items.map((sub, i) => {
                  const isHovered = hovered === sub;
                  return (
                    <li key={`${sub.label}-${i}`}>
                      <Link
                        href={sub.href}
                        onClick={onItemClick}
                        onMouseEnter={() => setHovered(sub)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          "group flex items-center transition-colors font-medium relative w-fit",
                          colonnes.length > 3 ? "text-base" : "text-lg",
                          isHovered ? "text-primary" : "text-neutral-600 hover:text-primary"
                        )}
                      >
                        <span>{sub.label}</span>
                        <span className={cn(
                          "absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300",
                          isHovered ? "w-full" : "w-0 group-hover:w-full"
                        )} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Interactive Featured Card */}
      <div className="w-[360px] shrink-0 rounded-[24px] overflow-hidden relative shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            // Rejoue l'animation même quand deux entrées partagent l'image de
            // repli : l'image seule ne suffit pas comme clé.
            key={`${currentTitle}|${currentImage}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Image de fond */}
            <Image
              src={currentImage}
              alt={currentTitle}
              fill
              className="object-cover"
              sizes="360px"
            />
            {/* Gradient Overlay pour lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/40 to-transparent" />
            
            {/* Contenu textuel superposé */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest border border-white/20 w-fit">
                {hovered ? "Catégorie" : "Premium"}
              </div>
              
              <h4 className="text-2xl font-bold mb-2 drop-shadow-md">
                {currentTitle}
              </h4>
              
              <p className="text-white/80 text-[14px] leading-relaxed mb-6 font-medium line-clamp-3">
                {currentDesc}
              </p>
              
              <Link 
                href={item.featured?.href || "/properties"}
                onClick={onItemClick}
                className="inline-flex items-center gap-2 text-primary font-bold text-[15px] hover:text-white transition-colors group/link"
              >
                {item.featured?.cta || "Voir les détails"}
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Simple dropdown (Interactive Dynamic Split Layout) ─────────────────
function SimpleContent({
  items,
  onItemClick,
}: {
  items: MenuSubItem[];
  onItemClick: () => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const activeItem = items[hoveredIndex] || items[0];

  if (!activeItem) return null;

  // Comme pour le méga-menu : le visuel est porté par l'entrée elle-même.
  const currentImage =
    activeItem.image ||
    (activeItem.icon ? MENU_IMAGES_PAR_ICONE[activeItem.icon] : undefined) ||
    MENU_FALLBACK_IMAGE;

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Section Liste (Gauche) */}
      <div className="flex-1 p-4">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {items.map((sub, idx) => {
            const Icon = sub.icon ? MENU_ICONS[sub.icon] : undefined;
            const isHovered = hoveredIndex === idx;
            
            return (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  onClick={onItemClick}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className={cn(
                    "group flex items-start gap-5 p-4 rounded-2xl transition-all duration-300 border border-transparent",
                    isHovered ? "bg-stone-50 border-stone-100 shadow-sm" : "hover:bg-stone-50"
                  )}
                >
                  {/* Dark Icon Box */}
                  {Icon && (
                    <div className={cn(
                      "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isHovered 
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" 
                        : "bg-neutral-900 text-white"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                  
                  {/* Text Content */}
                  <div>
                    <div className={cn(
                      "text-lg font-bold mb-1 transition-colors",
                      isHovered ? "text-primary" : "text-secondary group-hover:text-primary"
                    )}>
                      {sub.label}
                    </div>
                    {sub.description && (
                      <div className="text-[13.5px] font-medium text-neutral-500 leading-relaxed">
                        {sub.description}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Section Visuelle Dynamique (Droite) */}
      <div className="w-[360px] shrink-0 rounded-[24px] overflow-hidden relative shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={hoveredIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Image de fond */}
            <Image
              src={currentImage}
              alt={activeItem.label}
              fill
              className="object-cover"
              sizes="360px"
            />
            {/* Gradient Overlay pour lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/40 to-transparent" />
            
            {/* Contenu textuel superposé */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest border border-white/20 w-fit">
                Découvrir
              </div>
              
              <h4 className="text-2xl font-bold mb-2 drop-shadow-md">
                {activeItem.label}
              </h4>
              
              <p className="text-white/80 text-[14px] leading-relaxed mb-6 font-medium line-clamp-2">
                {activeItem.description || "Découvrez nos solutions sur mesure pour ce service."}
              </p>
              
              <Link 
                href={activeItem.href}
                onClick={onItemClick}
                className="inline-flex items-center gap-2 text-primary font-bold text-[15px] hover:text-white transition-colors group/link"
              >
                Voir les détails
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
