"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/config/site";

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
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Mapping d'images spécifiques pour les sous-items de "Biens"
  const getImageForLabel = (label: string) => {
    const map: Record<string, string> = {
      "Tous les biens": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
      "Villas": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      "Duplex": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
      "Maisons": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
      "Terrains": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
      "Locaux commerciaux": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      "Bureaux": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800",
      "Entrepôts": "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
      "Vente": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
      "Location nue": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800",
      "Location meublée": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
      "Bail commercial": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      "Gestion locative": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      "Cocody": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=800",
      "Plateau": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800",
      "Marcory": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=800",
      "Riviera": "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    };
    return map[label] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800";
  };

  const defaultImage = "/images/photos/immeuble1.jpg";
  const currentImage = hoveredLabel ? getImageForLabel(hoveredLabel) : defaultImage;
  const currentTitle = hoveredLabel || item.featured?.title || "Découvrir";
  const currentDesc = hoveredLabel ? `Découvrez nos offres pour : ${hoveredLabel}` : item.featured?.description;

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Left side: Columns */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-3 gap-8">
          {item.columns!.map((col) => (
            <div key={col.title}>
              <h4 className="text-base font-bold uppercase tracking-wider text-secondary mb-6 border-l-4 border-primary pl-4 whitespace-nowrap">
                {col.title}
              </h4>
              <ul className="space-y-4">
                {col.items.map((sub) => {
                  const isHovered = hoveredLabel === sub.label;
                  return (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        onClick={onItemClick}
                        onMouseEnter={() => setHoveredLabel(sub.label)}
                        onMouseLeave={() => setHoveredLabel(null)}
                        className={cn(
                          "group flex items-center text-lg transition-colors font-medium relative w-fit",
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
            key={currentImage} // Force re-render on image change
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
                {hoveredLabel ? "Catégorie" : "Premium"}
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
  items: import("@/config/site").MenuSubItem[];
  onItemClick: () => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const activeItem = items[hoveredIndex] || items[0];

  const getImageForLabel = (label: string) => {
    const map: Record<string, string> = {
      "Vente de biens": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
      "Location meublée": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
      "Gestion immobilière": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      "Décoration & aménagement": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
      "Construction": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
      "Promotion immobilière": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
      "À propos": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      "Notre équipe": "/images/photos/team.jpg",
      "Blog": "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
    };
    return map[label] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800";
  };

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Section Liste (Gauche) */}
      <div className="flex-1 p-4">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {items.map((sub, idx) => {
            const Icon = sub.icon;
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
              src={getImageForLabel(activeItem.label)}
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
