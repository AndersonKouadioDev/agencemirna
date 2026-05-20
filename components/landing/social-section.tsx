import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Youtube,
} from "lucide-react";

/**
 * Section "Suivez-nous" :
 * - Grille 2×3 d'images type Instagram (placeholders — biens du site)
 * - Liens vers tous les réseaux sociaux
 * - CTA WhatsApp principal
 *
 * À terme : pourrait être remplacé par un vrai embed Instagram via
 * leur API ou par un lien direct.
 */

const PLACEHOLDER_IMAGES = [
  "/images/biens/bien1.jpg",
  "/images/biens/bien3.jpg",
  "/images/biens/bien6.jpg",
  "/images/biens/bien10.jpg",
  "/images/biens/bien1.jpg",
  "/images/biens/bien3.jpg",
];

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/agencemirna",
    color: "hover:text-pink-600",
    bg: "hover:bg-pink-50",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/agencemirna",
    color: "hover:text-blue-600",
    bg: "hover:bg-blue-50",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/company/agencemirna",
    color: "hover:text-sky-600",
    bg: "hover:bg-sky-50",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@agencemirna",
    color: "hover:text-red-600",
    bg: "hover:bg-red-50",
  },
];

export default function SocialSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-center">
          {/* Colonne gauche : texte + réseaux */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Restons connectés
            </p>
            <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              Suivez Agence Mirna
            </h2>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              Visites exclusives, nouveautés du marché, conseils d'experts :
              retrouvez toute l'actualité immobilière d'Abidjan sur nos
              réseaux sociaux.
            </p>

            {/* Boutons réseaux */}
            <div className="mt-8 grid grid-cols-4 gap-2">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border border-stone-200 bg-white py-4 text-neutral-600 transition-colors ${s.color} ${s.bg}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium">{s.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* CTA WhatsApp */}
            <Link
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                "https://wa.me/22501434831131"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Discuter sur WhatsApp
            </Link>
          </div>

          {/* Colonne droite : mosaïque type Instagram */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {PLACEHOLDER_IMAGES.map((src, i) => (
              <Link
                key={i}
                href="https://instagram.com/agencemirna"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
