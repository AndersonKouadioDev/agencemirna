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
import { ChevronDown } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { MegaMenu } from "./mega-menu";

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggle: () => void;
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
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined) {
      if (latest > previous && latest > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    }
  });

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
      <motion.header
        className="fixed top-[40px] w-full z-50"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : "-140%" }}
        transition={{ duration: 0.3 }}
      >
        <nav className="relative z-[1000] w-full bg-white">
          <div className="relative z-30">
            <div className="container mx-auto md:px-12 lg:py-0 lg:px-10">
              <div className="flex items-center justify-between py-4 gap-6 md:gap-0">
                <div className="px-2 sm:px-6 flex justify-between gap-4 items-center w-full">
                  <div className="flex items-center gap-4">
                    <MobileMenuButton
                      isOpen={isOpen}
                      toggle={() => setIsOpen(!isOpen)}
                    />

                    <Link href="/" aria-label="logo">
                      <Image
                        src="/images/logo.png"
                        className="w-24 md:w-36"
                        alt="tailus logo"
                        width="144"
                        height="68"
                      />
                    </Link>
                  </div>

                  <nav className="hidden md:flex w-full items-center justify-center">
                    <div className="flex items-center gap-1">
                      {menuItems.map((item) => (
                        <MegaMenu key={item.id} item={item} />
                      ))}
                    </div>
                  </nav>
                </div>
                <Link
                  href={"/properties"}
                  className={buttonVariants({
                    className: "h-9 sm:h-10 xl:h-12 w-40",
                  })}
                >
                  Réserver
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div
          aria-hidden="true"
          className="container max-w-screen-2xl h-4 -mt-6 mx-auto bg-primary/30 dark:bg-green-900/30 blur md:-mt-4"
        ></div>
      </motion.header>
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
}) => (
  <button
    onClick={toggle}
    className="md:hidden w-10 h-10 relative focus:outline-none"
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-0 w-full max-h-[calc(100vh-5rem)] overflow-y-auto bg-primary shadow-lg md:hidden z-50"
      >
        <nav className="flex flex-col py-4">
          {menuItems.map((item: MenuItem) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: item.id * 0.1 }}
            >
              <MobileMenuEntry item={item} closeMenu={closeMenu} />
            </motion.div>
          ))}
        </nav>
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
      <Link
        href={item.href ?? "#"}
        className={cn(
          "block px-4 py-3 transition-colors text-base",
          item.active
            ? "text-white font-bold underline underline-offset-4"
            : "text-secondary hover:text-white"
        )}
        onClick={closeMenu}
      >
        {item.label}
      </Link>
    );
  }

  // Cas 2 & 3 : item avec sous-menu → accordéon
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-base transition-colors",
          item.active
            ? "text-white font-bold"
            : "text-secondary hover:text-white"
        )}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-primary/80"
          >
            <div className="py-2">
              {/* Lien parent vers la page principale (si défini) */}
              {item.href && (
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="block px-6 py-2 text-sm font-semibold text-white/90 hover:text-white"
                >
                  → Voir tout
                </Link>
              )}

              {/* Mega menu : colonnes avec titres */}
              {item.columns?.map((col) => (
                <div key={col.title} className="mt-2">
                  <div className="px-6 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
                    {col.title}
                  </div>
                  <ul>
                    {col.items.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            onClick={closeMenu}
                            className="flex items-center gap-2 px-6 py-2 text-sm text-secondary hover:text-white hover:bg-primary/60 transition-colors"
                          >
                            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                            <span>{sub.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* Simple dropdown : items avec icône + description */}
              {item.simpleItems && (
                <ul className="mt-1">
                  {item.simpleItems.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={closeMenu}
                          className="flex items-start gap-3 px-6 py-2.5 hover:bg-primary/60 transition-colors"
                        >
                          {Icon && (
                            <Icon className="h-4 w-4 text-white/80 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">
                              {sub.label}
                            </div>
                            {sub.description && (
                              <div className="text-xs text-white/70 mt-0.5">
                                {sub.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Featured card en bas (uniquement pour mega) */}
              {item.featured && (
                <Link
                  href={item.featured.href}
                  onClick={closeMenu}
                  className="mx-4 mt-3 mb-2 block rounded-lg bg-secondary p-3"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    {item.featured.title}
                  </div>
                  <div className="text-xs text-white/80 mb-2">
                    {item.featured.description}
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    {item.featured.cta} →
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
