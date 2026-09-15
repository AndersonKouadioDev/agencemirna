import Image from "next/image";
import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import type { PublicAnnonce } from "@/src/actions/public";
import { annonceHref } from "@/src/lib/annonce";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { formatNumber } from "@/utils/formatNumber";

function badgeColor(type: string | null | undefined) {
  const t = (type ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (t.includes("promotion") || t.includes("baisse")) return "bg-red-50 text-red-600 border-red-200";
  if (t.includes("exclusiv")) return "bg-amber-50 text-[#F5B324] border-amber-200";
  if (t.includes("coup")) return "bg-rose-50 text-rose-600 border-rose-200";
  return "bg-stone-50 text-stone-600 border-stone-200";
}

export default function AnnonceCard({ annonce }: { annonce: PublicAnnonce }) {
  const href = annonceHref(annonce);
  const type = annonce.types_annonce?.name ?? null;
  const bien = annonce.bien;
  const image = normaliserUrlImage(annonce.image) || normaliserUrlImage(bien?.image) || null;
  const prix = bien?.prix ?? null;
  const prixMois = bien?.prix_month ?? null;

  const contenu = (
    <div className="group relative bg-white border border-stone-200 border-t-4 border-t-primary p-6 md:p-8 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* EN-TÊTE : Type et Sous-titre */}
      <div className="flex items-center justify-between mb-5">
        {type ? (
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full ${badgeColor(type)}`}>
            {type}
          </span>
        ) : (
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full bg-stone-50 text-stone-500 border-stone-200">
            Opportunité
          </span>
        )}
        
        {annonce.sous_titre && (
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate max-w-[50%] text-right">
            {annonce.sous_titre}
          </span>
        )}
      </div>

      {/* TITRE : Grand et éditorial */}
      <h3 className="font-agate text-2xl md:text-3xl font-bold text-secondary leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
        {annonce.title}
      </h3>

      {/* DESCRIPTION */}
      {annonce.description && (
        <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {annonce.description}
        </p>
      )}

      {/* IMAGE : Encart style article ou post */}
      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-stone-100 mb-6 mt-auto">
        {image ? (
          <Image
            src={image}
            alt={annonce.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className="h-8 w-8 text-stone-300" />
          </div>
        )}
        
        {/* Petit Overlay sur l'image pour indiquer la zone géographique */}
        {bien?.ville_commune && (
           <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-stone-600 shadow-sm">
             {bien.ville_commune}
           </div>
        )}
      </div>

      {/* PIED DE CARTE : Prix & CTA */}
      <div className="pt-5 border-t border-dashed border-stone-200 flex items-center justify-between">
        <div className="flex flex-col">
          {prixMois != null ? (
            <>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-0.5">Loyer</span>
              <span className="font-bold text-lg text-secondary">{formatNumber(prixMois)} <span className="text-xs font-normal text-stone-500">FCFA/m</span></span>
            </>
          ) : prix != null ? (
            <>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-0.5">Prix Offre</span>
              <span className="font-bold text-lg text-secondary">{formatNumber(prix)} <span className="text-xs font-normal text-stone-500">FCFA</span></span>
            </>
          ) : (
            <span className="font-bold text-sm text-stone-500">Sur demande</span>
          )}
        </div>
        
        <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary group-hover:text-secondary transition-colors">
          {annonce.cta_label || "Découvrir"}
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
      {contenu}
    </Link>
  ) : (
    <div className="block h-full">{contenu}</div>
  );
}
