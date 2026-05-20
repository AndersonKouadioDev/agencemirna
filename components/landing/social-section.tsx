import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  MessageCircle,
  Star,
  Youtube,
} from "lucide-react";

/**
 * Section "Suivez-nous & On parle de nous" — preuve sociale enrichie.
 *
 * Layout 3 colonnes desktop :
 *  1. Réseaux + CTA WhatsApp + mini grille Instagram preview
 *  2. Mosaïque Instagram grande (1 large + 4 carrées)
 *  3. Aside "On parle de nous" — feed style social (FB / IG / Google)
 *  Mobile : tout en stack.
 *
 * Les mentions sont actuellement hardcodées mais plausibles. À terme,
 * on peut les charger depuis une table `social_mentions` ou les API
 * Facebook/Instagram Business / Google Reviews.
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

type Mention = {
  network: "facebook" | "instagram" | "google";
  author: string;
  handle: string;
  text: string;
  date: string;
  likes?: number;
  rating?: number;
};

const MENTIONS: Mention[] = [
  {
    network: "facebook",
    author: "Aïcha K.",
    handle: "Marcory Zone 4",
    text: "Service impeccable, locataires trouvés en 2 semaines pour mon appart. L'équipe Mirna est ultra pro 👌",
    date: "Il y a 3 jours",
    likes: 24,
  },
  {
    network: "google",
    author: "Thomas R.",
    handle: "Google Reviews",
    text: "Trouvé un studio meublé à Cocody en 4 jours. Visite virtuelle, contrat à distance, parfait pour les expats.",
    date: "Il y a 1 semaine",
    rating: 5,
  },
  {
    network: "instagram",
    author: "Yves M.",
    handle: "@yves.invest",
    text: "Le seul cabinet d'Abidjan qui présente des dossiers d'invest sérieux avec ROI clair. Recommandé.",
    date: "Il y a 2 semaines",
    likes: 47,
  },
];

const NETWORK_META: Record<
  Mention["network"],
  { icon: typeof Facebook; bg: string; label: string }
> = {
  facebook: { icon: Facebook, bg: "bg-blue-500", label: "Facebook" },
  instagram: {
    icon: Instagram,
    bg: "bg-gradient-to-br from-pink-500 to-purple-500",
    label: "Instagram",
  },
  google: { icon: Star, bg: "bg-amber-500", label: "Google" },
};

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
            Visites exclusives, nouveautés du marché, conseils d'experts et
            avis clients : retrouvez toute notre actualité.
          </p>
        </div>

        {/* Layout 3 colonnes desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1.1fr] gap-8 lg:gap-10">
          {/* COL 1 — Réseaux + WhatsApp + mini grid Insta */}
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

          {/* COL 2 — Mosaïque Instagram grande */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {INSTAGRAM_GRID.map((src, i) => (
              <Link
                key={i}
                href="https://instagram.com/agencemirna"
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-xl ${
                  i === 0
                    ? "col-span-2 aspect-[16/10]"
                    : "aspect-square"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

          {/* COL 3 — Aside "On parle de nous" */}
          <aside>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-agate text-xl font-bold text-secondary">
                On parle de nous
              </h3>
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                En direct
              </span>
            </div>

            <div className="space-y-4">
              {MENTIONS.map((m, i) => {
                const meta = NETWORK_META[m.network];
                const Icon = meta.icon;
                return (
                  <article
                    key={i}
                    className="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-md hover:border-stone-300 transition-all"
                  >
                    <header className="flex items-center gap-3 mb-2">
                      <div
                        className={`h-9 w-9 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-secondary truncate">
                          {m.author}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {m.handle} · {meta.label}
                        </div>
                      </div>
                      {m.rating && (
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: m.rating }).map((_, k) => (
                            <Star
                              key={k}
                              className="h-3 w-3 fill-amber-500 text-amber-500"
                            />
                          ))}
                        </div>
                      )}
                    </header>
                    <p className="text-sm text-neutral-700 leading-relaxed line-clamp-4">
                      {m.text}
                    </p>
                    <footer className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>{m.date}</span>
                      {m.likes !== undefined && (
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {m.likes}
                        </span>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>

            <Link
              href="/contact_us"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all"
            >
              Laissez-nous votre avis
              <MessageCircle className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
