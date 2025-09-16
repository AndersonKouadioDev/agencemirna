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
      label: "A propos",
      href: "/about",
      active: pathname === "/about",
    },
    {
      id: 5,
      label: "Contact",
      href: "/contact_us",
      active: pathname === "/contact_us",
    },
  ];
};
