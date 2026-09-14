import Image from "next/image";
import Link from "next/link";
import { BedIcon, BathIcon, MapPinIcon, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicAnnonce } from "@/src/actions/public";
import { annonceHref } from "@/src/lib/annonce";
import { formatNumber } from "@/utils/formatNumber";

/**
 * Couleur du badge selon le type d'annonce. Les libellés viennent de la table
 * `types_annonce`, on compare donc sans accent ni casse.
 */
function badgeClass(type: string | null | undefined) {
  const t = (type ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (t.includes("promotion") || t.includes("baisse")) return "bg-red-500";
  if (t.includes("exclusiv")) return "bg-[#F5B324]";
  if (t.includes("coup")) return "bg-rose-600";
  return "bg-[#1B3C35]";
}

/**
 * Carte d'annonce, partagée par l'accueil et la page /annonces.
 *
 * L'annonce ne porte que ce qui lui est propre — titre, type, accroche, visuel.
 * Le prix et les caractéristiques sont lus sur le bien mis en avant, pour
 * qu'une modification du bien se répercute sans ressaisie.
 */
export default function AnnonceCard({ annonce }: { annonce: PublicAnnonce }) {
  const type = annonce.types_annonce?.name ?? null;
  const bien = annonce.bien;

  // Visuel de l'annonce, sinon photo du bien mis en avant.
  const image = annonce.image || bien?.image || null;

  // Un bien en location affiche son loyer mensuel, un bien en vente son prix.
  const prix = bien?.prix ?? null;
  const prixMois = bien?.prix_month ?? null;

  return (
    <Link href={annonceHref(annonce) as any} className="group block h-full">
      <div className="bg-white rounded-[2rem] overflow-hidden h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-100">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {image ? (
            <Image
              src={image}
              alt={annonce.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-stone-300">
              <Maximize2 className="h-8 w-8" />
            </div>
          )}
          {type && (
            <Badge
              className={`absolute top-4 left-4 ${badgeClass(type)} text-white border-none px-3 py-1 font-bold tracking-wide`}
            >
              {type}
            </Badge>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col grow">
          <h3 className="font-bold text-xl text-secondary leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {annonce.title}
          </h3>

          {annonce.sous_titre && (
            <p className="text-stone-500 text-sm font-medium mb-3 line-clamp-2">
              {annonce.sous_titre}
            </p>
          )}

          {bien?.ville_commune && (
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span className="truncate">{bien.ville_commune}</span>
            </div>
          )}

          {/* Caractéristiques lues sur le bien, jamais ressaisies sur l'annonce */}
          {bien && (bien.chambre != null || bien.salle_bains != null || bien.area != null) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {bien.chambre != null && (
                <span className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600">
                  <BedIcon className="h-3.5 w-3.5 text-stone-400" />
                  {bien.chambre}
                </span>
              )}
              {bien.salle_bains != null && (
                <span className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600">
                  <BathIcon className="h-3.5 w-3.5 text-stone-400" />
                  {bien.salle_bains}
                </span>
              )}
              {bien.area != null && (
                <span className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600">
                  <Maximize2 className="h-3.5 w-3.5 text-stone-400" />
                  {formatNumber(bien.area)} m²
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-stone-200/60 flex items-end justify-between gap-3">
            <div>
              {prixMois != null ? (
                <span className="text-lg font-bold text-[#F5B324]">
                  {formatNumber(prixMois)} FCFA
                  <span className="text-xs font-normal text-stone-500"> /mois</span>
                </span>
              ) : prix != null ? (
                <span className="text-lg font-bold text-[#F5B324]">
                  {formatNumber(prix)} FCFA
                </span>
              ) : (
                <span className="text-sm font-semibold text-stone-400">
                  Prix sur demande
                </span>
              )}
            </div>
            {annonce.cta_label && (
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 group-hover:text-primary transition-colors">
                {annonce.cta_label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
