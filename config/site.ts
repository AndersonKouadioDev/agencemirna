export const getMenuList = (pathname: string): menuItem[] => {
  return [
    {
      id: 1,
      label: "Accueil",
      href: "/",
      active: pathname === "/",
    },
    {
      id: 2,
      label: "Propriétés",
      href: "/properties",
      active: pathname.startsWith("/properties"),
    },
    {
      id: 3,
      label: "Services",
      href: "/services",
      active: pathname.startsWith("/services"),
    },
    {
      id: 4,
      label: "Promotions",
      href: "/promotions",
      active: pathname.startsWith("/promotions"),
    },
    {
      id: 5,
      label: "Agents",
      href: "/agents",
      active: pathname.startsWith("/agents"),
    },
    {
      id: 6,
      label: "À propos",
      href: "/about",
      active: pathname === "/about",
    },
    {
      id: 7,
      label: "Contact",
      href: "/contact_us",
      active: pathname === "/contact_us",
    },
  ];
};
