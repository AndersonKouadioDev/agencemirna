"use client";

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  Home,
  Users,
  Star,
  Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const STATS = [
  { icon: Home, value: "100+", label: "Biens" },
  { icon: Users, value: "50K+", label: "Clients satisfaits" },
  { icon: Star, value: "4.8", label: "Avis moyen" },
  { icon: Clock, value: "24/7", label: "Support" },
];

export function SiteFooter() {
  return (
    <section className="bg-white pt-20 pb-10 border-t border-stone-100">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-stone-100 mb-16">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-stone-400 shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-secondary">{stat.value}</span>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{stat.label}</span>
                </div>
              </div>
            );
          })}
          {/* Socials on the right in mockup, we can put them anywhere, let's add them to the right of stats on desktop */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4 flex justify-between items-center mt-4 md:mt-0 lg:absolute lg:right-8 lg:mt-2">
             <div className="hidden lg:flex items-center gap-4">
               <span className="text-sm font-semibold text-stone-600">Suivez-nous</span>
               <div className="flex gap-2">
                 <Link href="#" className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"><FacebookIcon className="h-4 w-4" /></Link>
                 <Link href="#" className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"><InstagramIcon className="h-4 w-4" /></Link>
                 <Link href="#" className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"><TwitterIcon className="h-4 w-4" /></Link>
                 <Link href="#" className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"><YoutubeIcon className="h-4 w-4" /></Link>
               </div>
             </div>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Logo & Intro */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/images/icon.png" alt="Logo" width={32} height={32} />
              <span className="font-bold text-xl text-secondary">Agence Mirna</span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              Nous vous rapprochons des plus belles propriétés avec des expériences inoubliables.
            </p>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h4 className="font-bold text-secondary mb-6">L'Agence</h4>
            <div className="flex flex-col gap-4 text-sm text-stone-500">
              <Link href="/about" className="hover:text-primary transition-colors">À propos</Link>
              <Link href="/agents" className="hover:text-primary transition-colors">Notre équipe</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">Presse</Link>
              <Link href="/contact_us" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col">
            <h4 className="font-bold text-secondary mb-6">Support</h4>
            <div className="flex flex-col gap-4 text-sm text-stone-500">
              <Link href="/contact_us" className="hover:text-primary transition-colors">Centre d'aide</Link>
              <Link href="#" className="hover:text-primary transition-colors">FAQ</Link>
              <Link href="#" className="hover:text-primary transition-colors">Conditions générales</Link>
              <Link href="#" className="hover:text-primary transition-colors">Confidentialité</Link>
            </div>
          </div>

          {/* Top Destinations */}
          <div className="flex flex-col">
            <h4 className="font-bold text-secondary mb-6">Top Lieux</h4>
            <div className="flex flex-col gap-4 text-sm text-stone-500">
              <Link href="#" className="hover:text-primary transition-colors">Cocody, Abidjan</Link>
              <Link href="#" className="hover:text-primary transition-colors">Marcory, Abidjan</Link>
              <Link href="#" className="hover:text-primary transition-colors">Plateau, Abidjan</Link>
              <Link href="#" className="hover:text-primary transition-colors">Assinie</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1 flex flex-col">
            <h4 className="font-bold text-secondary mb-6">Newsletter</h4>
            <p className="text-sm text-stone-500 mb-4">
              Abonnez-vous pour recevoir des offres exclusives et de l'inspiration.
            </p>
            <div className="flex bg-stone-50 rounded-md p-1 border border-stone-200">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="bg-transparent border-none outline-none text-sm w-full px-3 text-stone-600 placeholder:text-stone-400"
              />
              <Button size="sm" className="bg-[#1B3C35] hover:bg-[#152e29] text-white">
                S'abonner
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-stone-100 text-xs text-stone-400">
          <p>© 2026 Agence Mirna. Tous droits réservés.</p>
          <p className="mt-2 md:mt-0">
            Développé par <a href="https://lunion-lab.com" target="_blank" className="hover:text-primary">LUNION-LAB</a>
          </p>
        </div>
      </div>
    </section>
  );
}