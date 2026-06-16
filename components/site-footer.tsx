"use client";

import {
  ChevronRightIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type FooterLink = { id: number; title: string; url: string };

const SOCIALS = [
  {
    name: "Instagram",
    icon: InstagramIcon,
    url: "https://instagram.com/agencemirna",
  },
  {
    name: "Facebook",
    icon: FacebookIcon,
    url: "https://facebook.com/agencemirna",
  },
  {
    name: "LinkedIn",
    icon: LinkedinIcon,
    url: "https://linkedin.com/company/agencemirna",
  },
  {
    name: "YouTube",
    icon: YoutubeIcon,
    url: "https://youtube.com/@agencemirna",
  },
];

const footerLinks: FooterLink[][] = [
  [
    { id: 1, title: "À propos", url: "/about" },
    { id: 2, title: "Contact", url: "/contact_us" },
    { id: 3, title: "Nos propriétés", url: "/properties" },
    { id: 4, title: "Nos services", url: "/services" },
  ],
  [
    { id: 5, title: "Notre équipe", url: "/agents" },
    { id: 6, title: "Promotions", url: "/promotions" },
    { id: 7, title: "WhatsApp", url: "https://wa.me/2250143483131" },
  ],
];

export function SiteFooter() {
  return (
    <section
      id="footer"
      className="relative isolate bg-secondary py-14 text-white"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Footer */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-start justify-start gap-y-5">
            <a href="/" className="flex items-center gap-3">
              <Image
                className="h-8 w-8"
                alt="Logo"
                src="/images/icon.png"
                width={100}
                height={100}
              />
              <h1 className="text-xl text-white">AGENCE MIRNA</h1>
            </a>
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="text-white hover:text-primary group bg-black rounded-full p-2"
                  >
                    <Icon className="h-4 w-4 transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12" />
                  </Link>
                );
              })}
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              © AGENCE MIRNA 2024. Tous droits réservés. | Développé par{" "}
              <Link
                target="_blank"
                href="https://lunion-lab.com"
                className="underline hover:text-violet-500"
              >
                LUINION-LAB
              </Link>
            </p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              {footerLinks.map((column, columnIndex) => (
                <ul key={columnIndex} className="flex flex-col gap-y-2">
                  {column.map((link) => (
                    <li
                      key={link.id}
                      className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug font-medium text-white duration-200 hover:text-primary"
                    >
                      <a href={link.url}>{link.title}</a>
                      <ChevronRightIcon className="h-4 w-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
