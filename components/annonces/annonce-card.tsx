import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicAnnonce } from "@/src/actions/public";
import { annonceHref, mediaAnnonce } from "@/src/lib/annonce";
import { montantUtile, prixSurDemande } from "@/src/lib/bien-prix";
import { formatNumber } from "@/utils/formatNumber";
import { AnnonceMedia } from "./annonce-media";

function badgeColor(type: string | null | undefined) {
  const t = (type ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (t.includes("promotion") || t.includes("baisse")) return "bg-red-50 text-red-600 border-red-200";
  if (t.includes("exclusiv")) return "bg-amber-50 text-[#F5B324] border-amber-200";
  if (t.includes("coup")) return "bg-rose-50 text-rose-600 border-rose-200";
  return "bg-stone-50 text-stone-600 border-stone-200";
}

export default function AnnonceCard({ annonce }: { annonce: PublicAnnonce }) {
  const href = annonceHref(annonce);
  const type = annonce.types_annonce?.name ?? null;
  const bien = annonce.bien;
  const media = mediaAnnonce(annonce);

  // Le montant n'est publié que s'il l'est sur la fiche du bien : une annonce
  // qui republierait un prix marqué « sur demande » contredirait la décision
  // prise en admin, sur la page même qui met ce bien en avant.
  const surDemande = prixSurDemande(bien);
  const prix = surDemande ? null : montantUtile(bien?.prix);
  const prixMois = surDemande ? null : montantUtile(bien?.prix_month);

  /**
   * Le lien recouvre la carte par son pseudo-élément plutôt que de l'envelopper.
   *
   * Une carte vidéo porte un bouton de lecture : imbriqué dans un `<a>`, il
   * produit un balisage invalide, que les navigateurs recousent chacun à leur
   * façon — et il devient inatteignable au clavier, la tabulation ne voyant
   * plus que le lien. Le lien étiré est le motif consacré pour ce cas : la
   * carte reste cliquable d'un bout à l'autre, et le bouton la surplombe.
   *
   * Le `z-[1]` du pseudo-élément n'est pas décoratif : le cadre du visuel est
   * `relative` et vient après le titre dans le DOM, donc il se peindrait
   * au-dessus d'un recouvrement laissé en `z-index: auto` — et le visuel d'une
   * annonce en image cesserait d'être cliquable, alors qu'il l'était avant.
   * Le bouton de lecture repasse devant avec son propre z-[2].
   */
  const titre = href ? (
    <Link
      href={href}
      className="rounded-sm outline-none after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:ring-2 focus-visible:ring-primary"
    >
      {annonce.title}
    </Link>
  ) : (
    annonce.title
  );

  return (
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
        {titre}
      </h3>

      {/* DESCRIPTION */}
      {annonce.description && (
        <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {annonce.description}
        </p>
      )}

      {/* VISUEL : image, ou vidéo à regarder */}
      <AnnonceMedia
        media={media}
        titre={annonce.title}
        legende={bien?.ville_commune}
        lienBien={href}
        libelleLien={annonce.cta_label}
      />

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

        {/* Sans destination — ni bien rattaché, ni lien valide — la carte est
            inerte : l'invitation à cliquer ne mènerait nulle part. */}
        {href && (
          <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary group-hover:text-secondary transition-colors">
            {annonce.cta_label || "Découvrir"}
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
}
