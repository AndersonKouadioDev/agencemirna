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
 * Section "Suivez-nous" : réseaux sociaux + mosaïque Instagram.
 *
 * Le bloc "On parle de nous" (avis sociaux) a été retiré car il faisait
 * doublon avec la section Témoignages (mêmes personnes, mêmes avis). La
 * preuve sociale "avis" vit désormais uniquement dans TestimonialsSection.
 *
 * Layout 2 colonnes desktop :
 *  1. Réseaux + CTA WhatsApp + mini grille Instagram preview
 *  2. Mosaïque Instagram grande (1 large + 4 carrées)
 */

const INSTAGRAM_PREVIEW = [
  "/images/biens/bien1.jpg",
  "/images/biens/bien3.jpg",
  "/images/biens/bien6.jpg",
  "/images/biens/bien10.jpg",
];

const INSTAGRAM_GRID = [
  "/images/biens/bien1.jpg",
  "/images/biens/bien3.jpg",
  "/images/biens/bien6.jpg",
  "/images/biens/bien10.jpg",
  "/images/biens/bien15.jpg",
  "/images/biens/bien21.jpg",
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
        {/* Header global */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Restons connectés
          </p>
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
            Suivez Agence Mirna
          </h2>
          <p className="mt-4 text-base text-neutral-700 leading-relaxed">
            Visites exclusives, nouveautés du marché, conseils d&apos;experts et
            avis clients : retrouvez toute notre actualité.
          </p>
        </div>

        {/* Layout 2 colonnes desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-10">
          {/* COL 1 : Réseaux + WhatsApp + mini grid Insta */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-neutral-700 transition-colors ${s.color} ${s.bg}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-semibold">{s.name}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                "https://wa.me/22501434831131"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Discuter sur WhatsApp
            </Link>

            <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-stone-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-secondary">
                    @agencemirna
                  </div>
                  <div className="text-xs text-neutral-500">
                    Notre Instagram
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {INSTAGRAM_PREVIEW.map((src, i) => (
                  <Link
                    key={i}
                    href="https://instagram.com/agencemirna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-lg group"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* COL 2 : Mosaïque Instagram grande */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {INSTAGRAM_GRID.map((src, i) => (
              <Link
                key={i}
                href="https://instagram.com/agencemirna"
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-xl ${
                  i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
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
