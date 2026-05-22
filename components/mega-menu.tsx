"use client";

import * as React from "react";
import Link from "next/link";
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
export function MegaMenu({ item }: { item: MenuItem }) {
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
          "relative px-4 py-2 text-sm font-medium transition-colors",
          item.active
            ? "text-secondary"
            : "text-neutral-600 hover:text-secondary",
        )}
      >
        {item.label}
        {item.active && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
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
          "relative inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors focus:outline-none",
          item.active || open
            ? "text-secondary"
            : "text-neutral-600 hover:text-secondary",
        )}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
        {(item.active || open) && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
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
              "absolute top-full mt-3 z-[200] rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden",
              isMega
                ? "left-1/2 -translate-x-1/2 w-[min(900px,calc(100vw-2rem))]"
                : "left-0 w-[360px]",
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

// ─── Mega menu (multi-colonnes + featured) ─────────────────────────────────
function MegaContent({
  item,
  onItemClick,
}: {
  item: MenuItem;
  onItemClick: () => void;
}) {
  const hasFeatured = !!item.featured;

  return (
    <div
      className={cn(
        "grid gap-0",
        hasFeatured ? "grid-cols-[1fr_280px]" : "grid-cols-1",
      )}
    >
      <div className="p-6 grid grid-cols-3 gap-x-6 gap-y-4">
        {item.columns!.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
              {col.title}
            </h4>
            <ul className="space-y-1">
              {col.items.map((sub) => {
                const Icon = sub.icon;
                return (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      onClick={onItemClick}
                      className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 text-sm text-neutral-700 hover:bg-stone-50 hover:text-secondary transition-colors"
                    >
                      {Icon && (
                        <Icon className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary transition-colors shrink-0" />
                      )}
                      <span className="font-medium">{sub.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {hasFeatured && item.featured && (
        <Link
          href={item.featured.href}
          onClick={onItemClick}
          className="group relative p-6 bg-gradient-to-br from-secondary to-secondary/90 text-white flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary mb-3">
              <Sparkles className="h-3 w-3" />
              Gratuit
            </div>
            <h4 className="font-agate text-xl font-bold leading-tight mb-2">
              {item.featured.title}
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              {item.featured.description}
            </p>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
            {item.featured.cta}
            <ArrowRight className="h-4 w-4" />
          </div>
          <div
            aria-hidden
            className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
          />
        </Link>
      )}
    </div>
  );
}

// ─── Simple dropdown (1 colonne) ───────────────────────────────────────────
function SimpleContent({
  items,
  onItemClick,
}: {
  items: import("@/config/site").MenuSubItem[];
  onItemClick: () => void;
}) {
  return (
    <ul className="p-2">
      {items.map((sub) => {
        const Icon = sub.icon;
        return (
          <li key={sub.href}>
            <Link
              href={sub.href}
              onClick={onItemClick}
              className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-stone-50 transition-colors"
            >
              {Icon && (
                <div className="shrink-0 mt-0.5 h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-secondary">
                  {sub.label}
                </div>
                {sub.description && (
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {sub.description}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
