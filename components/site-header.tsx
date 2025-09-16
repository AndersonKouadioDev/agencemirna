"use client";

import React, { useEffect, useState } from "react";
import { getMenuList } from "@/config/site";
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

import { Button, buttonVariants } from "@/components/ui/button";

// Définition des types
interface MenuItem {
  id: number;
  label: string;
  href: string;
  active: boolean;
}

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
        className="fixed w-full z-50 "
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : "-100%" }}
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

                  <nav className="hidden md:block w-full">
                    <ul
                      className="gap-y-6 tracking-wide 
                    text-gray-500 dark:text-gray-300 font-medium flex flex-col md:flex-row md:gap-y-0"
                    >
                      {menuItems.map((item: MenuItem) => (
                        <NavItem key={item.id} {...item} />
                      ))}
                    </ul>
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

const NavItem: React.FC<MenuItem> = ({ href, label, active }) => (
  <li>
    <Link href={href} className="block font-medium md:px-4">
      <div
        className={cn(
          "relative  before:absolute before:-bottom-2 md:before:-bottom-7 before:w-full",
          active
            ? "before:h-1 before:mx-auto before:mt-auto before:rounded-t-full before:bg-primary"
            : "group before:h-0.5 before:origin-left before:mt-auto before:rounded-full before:bg-orange-400 before:transition before:scale-x-0 group-hover:before:scale-x-100"
        )}
      >
        <span
          className={cn(
            "",
            active ? "text-secondary" : "group-hover:text-secondary"
          )}
        >
          {label}
        </span>
      </div>
    </Link>
  </li>
);

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
        className="fixed top-20 left-0 w-full bg-primary shadow-lg md:hidden z-50"
      >
        <nav className="flex flex-col py-4">
          {menuItems.map((item: MenuItem) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: item.id * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "block px-4 py-2 transition-colors",
                  item.active
                    ? "text-white font-bold underline underline-offset-4"
                    : "text-secondary hover:text-white"
                )}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
);
