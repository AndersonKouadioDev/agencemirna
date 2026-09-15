import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicPublicite } from "@/src/actions/public";
import { destinationPub, type FormatPub } from "@/src/lib/publicites";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { LecteurVideo } from "@/components/video/lecteur-video";

/**
 * Une publicité, rendue selon son type et le format de son emplacement.
 *
 * Trois types, un seul composant : le contour, le libellé « Publicité » et la
 * destination sont les mêmes ; seul le cœur change. Le FORMAT vient de
 * l'emplacement, pas de la pub — une image posée dans une colonne étroite se
 * cadre en portrait, la même sur un bandeau s'étire en large.
 *
 * Sans directive : rendue côté serveur seule, et côté client dans le
 * carrousel. Le lecteur vidéo, lui, est client ; l'image et le texte n'ont
 * besoin de rien.
 */

const CADRE: Record<FormatPub, string> = {
  bandeau: "aspect-[16/7] md:aspect-[21/7]",
  encart: "aspect-video",
  aside: "aspect-[4/5]",
};

function rendable(url: string | null | undefined): string | null {
  const v = normaliserUrlImage(url);
  return typeof v === "string" ? v : null;
}

export function PubCarte({ pub, format }: { pub: PublicPublicite; format: FormatPub }) {
  const href = destinationPub(pub);
  const visuel = rendable(pub.image) ?? rendable(pub.bien?.image);
  const cta = pub.cta_label?.trim() || (pub.bien ? "Voir le bien" : "Découvrir");

  // Le lien est étiré par pseudo-élément : la vidéo porte ses propres boutons
  // et un `<a>` qui l'envelopperait les rendrait inatteignables (voir la carte
  // d'annonce, même motif).
  const lienEtire = href ? (
    <Link
      href={href}
      className="after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none"
      aria-label={`${pub.accroche ?? pub.titre} — ${cta}`}
    >
      <span className="sr-only">{cta}</span>
    </Link>
  ) : null;

  const boutonCta = href ? (
    <span className="relative z-[2] inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-secondary shadow-md transition-transform group-hover/pub:translate-x-0.5">
      {cta}
      <ArrowRight className="h-3.5 w-3.5" />
    </span>
  ) : null;

  const etiquette = (
    <span className="absolute left-3 top-3 z-[2] rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
      Publicité
    </span>
  );

  if (pub.type === "video") {
    return (
      <article className="group/pub relative overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <LecteurVideo url={pub.video_url ?? ""} affiche={visuel} titre={pub.accroche ?? pub.titre} className="rounded-none" />
        {(pub.accroche || pub.corps || href) && (
          <div className="relative flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              {pub.accroche && <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{pub.accroche}</p>}
              {pub.corps && <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">{pub.corps}</p>}
            </div>
            {href && (
              <Link href={href} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-secondary shadow-md hover:bg-[#D4981C]">
                {cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </article>
    );
  }

  if (pub.type === "texte") {
    return (
      <article className="group/pub relative flex h-full flex-col justify-center gap-4 overflow-hidden rounded-[24px] border border-[#F5B324]/30 bg-secondary p-6 text-white shadow-sm md:p-8">
        {etiquette}
        {pub.accroche && <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5B324]">{pub.accroche}</p>}
        <p className={`font-agate font-bold leading-tight ${format === "bandeau" ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"}`}>
          {pub.corps}
        </p>
        {pub.bien?.name && <p className="text-sm text-white/70">{pub.bien.name}{pub.bien.ville_commune ? ` · ${pub.bien.ville_commune}` : ""}</p>}
        {boutonCta && <div>{boutonCta}</div>}
        {lienEtire}
      </article>
    );
  }

  // image
  return (
    <article className={`group/pub relative overflow-hidden rounded-[24px] bg-stone-200 shadow-sm ${CADRE[format]}`}>
      {visuel && (
        <Image
          src={visuel}
          alt={pub.accroche ?? pub.titre}
          fill
          sizes={format === "aside" ? "(max-width: 1024px) 100vw, 33vw" : "100vw"}
          className="object-cover transition-transform duration-700 group-hover/pub:scale-105"
        />
      )}
      {etiquette}
      {(pub.accroche || pub.corps || boutonCta) && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 text-white md:p-7">
          {pub.accroche && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B324]">{pub.accroche}</p>}
          {pub.corps && <p className={`font-agate font-bold leading-tight drop-shadow ${format === "bandeau" ? "text-2xl md:text-4xl" : "text-lg md:text-2xl"}`}>{pub.corps}</p>}
          {boutonCta}
        </div>
      )}
      {lienEtire}
    </article>
  );
}
