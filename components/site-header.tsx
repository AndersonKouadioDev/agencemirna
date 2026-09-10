"use client";

import React, { useEffect, useState } from "react";
import { getMenuList, type MenuItem } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, KeyRound, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { MegaMenu } from "./mega-menu";

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggle: () => void;
  onDark?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  closeMenu: () => void;
}
export const Header = () => {
  const pathname = usePathname();
  const menuItems = getMenuList(pathname);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", isOpen);
  }, [isOpen]);

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    window.addEventListener("orientationchange", closeMenu);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("orientationchange", closeMenu);
      window.removeEventListener("resize", closeMenu);
    };
  }, []);

  return (
    <>
      <header className="fixed top-[40px] w-full z-50">
        <nav className="relative z-[1000] w-full border-b border-stone-200/80 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
          <div className="relative z-30">
            <div className="container mx-auto px-4 md:px-12 lg:px-10">
              <div className="flex items-center justify-between h-16 md:h-20">
                {/* Gauche : Logo */}
                <div className="flex items-center gap-4">
                  <MobileMenuButton
                    isOpen={isOpen}
                    toggle={() => setIsOpen(!isOpen)}
                    onDark={false}
                  />

                  <Link href="/" aria-label="logo">
                    <Image
                      src="/images/logo.png"
                      className="w-24 transition md:w-32"
                      alt="Agence Mirna"
                      width="144"
                      height="68"
                    />
                  </Link>
                </div>

                {/* Centre : Liens purs (sans capsule) */}
                <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 relative">
                  {menuItems.map((item) => (
                    <MegaMenu
                      key={item.id}
                      item={item}
                      onDark={false}
                    />
                  ))}
                </nav>

                {/* Droite : CTA Réserver */}
                <div className="flex items-center">
                  <Link
                    href={"/properties"}
                    className={cn(
                      buttonVariants(),
                      "h-10 gap-2 rounded-full px-5 shadow-lg shadow-primary/25 ring-1 ring-primary/30 transition-transform hover:scale-[1.03] xl:h-11 xl:px-6",
                    )}
                  >
                    <KeyRound className="h-4 w-4" />
                    <span className="hidden sm:inline">Réserver</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <MobileMenu
        isOpen={isOpen}
        menuItems={menuItems}
        closeMenu={() => setIsOpen(false)}
      />
    </>
  );
};

// NavItem retiré : remplacé par <MegaMenu /> qui gère les items simples
// et les items avec sous-menus.

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  toggle,
  onDark,
}) => (
  <button
    onClick={toggle}
    className={cn(
      "lg:hidden w-10 h-10 relative focus:outline-none transition-colors",
      onDark ? "text-white" : "text-secondary",
    )}
  >
    <span className="sr-only">Open main menu</span>
    <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <span
        aria-hidden="true"
        className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
          isOpen ? "rotate-45" : "-translate-y-1.5"
        }`}
      />
      <span
        aria-hidden="true"
        className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        aria-hidden="true"
        className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
          isOpen ? "-rotate-45" : "translate-y-1.5"
        }`}
      />
    </div>
  </button>
);



const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  menuItems,
  closeMenu,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 w-full h-[100dvh] bg-white lg:hidden z-[9999] flex flex-col"
      >
        {/* Header du menu mobile */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <Link href="/" aria-label="logo" onClick={closeMenu}>
            <Image
              src="/images/logo.png"
              className="w-24"
              alt="Agence Mirna"
              width="144"
              height="68"
            />
          </Link>
          <button
            onClick={closeMenu}
            className="h-10 w-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps du menu */}
        <nav className="flex-1 overflow-y-auto flex flex-col px-6 py-4">
          <div className="flex flex-col gap-2">
            {menuItems.map((item: MenuItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
              >
                <MobileMenuEntry item={item} closeMenu={closeMenu} />
              </motion.div>
            ))}
          </div>
        </nav>

        {/* Pied du menu avec contact direct */}
        <div className="p-6 border-t border-stone-100 bg-stone-50">
          <Link
            href="/contact_us"
            onClick={closeMenu}
            className={cn(
              buttonVariants(),
              "w-full h-12 rounded-full text-base font-bold shadow-lg shadow-primary/20"
            )}
          >
            Estimer mon bien
          </Link>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * Une entrée du menu mobile. Trois cas :
 *  - Item simple (pas de sous-menu) → <Link> direct
 *  - Item avec sous-menu → accordéon (bouton qui toggle, liste imbriquée)
 *  - Item mega (colonnes) → on aplatit les colonnes en sections avec titre
 */
const MobileMenuEntry: React.FC<{
  item: MenuItem;
  closeMenu: () => void;
}> = ({ item, closeMenu }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubmenu = !!(item.columns?.length || item.simpleItems?.length);

  // Cas 1 : item simple → lien direct
  if (!hasSubmenu) {
    return (
      <div className="border-b border-stone-100 last:border-0">
        <Link
          href={item.href ?? "#"}
          className={cn(
            "block py-4 transition-colors text-xl font-medium",
            item.active
              ? "text-primary font-bold"
              : "text-secondary hover:text-primary"
          )}
          onClick={closeMenu}
        >
          {item.label}
        </Link>
      </div>
    );
  }

  // Cas 2 & 3 : item avec sous-menu → accordéon
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "w-full flex items-center justify-between py-4 transition-colors text-xl font-medium",
          expanded ? "text-primary" : "text-secondary"
        )}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-stone-400 transition-transform duration-300",
            expanded && "rotate-180 text-primary"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1">
              {/* Lien parent vers la page principale (si défini) */}
              {item.href && (
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="block px-6 py-2 text-sm font-semibold text-secondary group-hover:text-primary transition-colors/90 hover:text-white"
                >
                  → Voir tout
                </Link>
              )}

              {/* Mega menu : colonnes avec titres */}
              {item.columns?.map((col) => (
                <div key={col.title} className="mt-2">
                  <div className="px-6 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {col.title}
                  </div>
                  <ul className="grid grid-cols-2 gap-2 mt-2">
                    {col.items.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            onClick={closeMenu}
                            className="flex items-center gap-3 py-3 px-3 hover:bg-stone-50 rounded-xl transition-colors group"
                          >
                            {Icon && <Icon className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:scale-110" />}
                            <span className="text-[15px] font-medium text-stone-700 group-hover:text-primary transition-colors">{sub.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* Simple dropdown : items avec icône */}
              {item.simpleItems && (
                <ul className="mt-2 space-y-1">
                  {item.simpleItems.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={closeMenu}
                          className="flex items-center gap-3 py-3 px-3 hover:bg-stone-50 rounded-xl transition-colors group"
                        >
                          {Icon && (
                            <Icon className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[15px] font-medium text-stone-700 group-hover:text-primary transition-colors">
                              {sub.label}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
