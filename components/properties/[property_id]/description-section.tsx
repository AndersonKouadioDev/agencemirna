"use client";

import type { SiteContact } from "@/src/lib/site-contact";
import { estMeuble, estVente } from "@/src/lib/bien-nature";
import { montantUtile, prixPrincipal } from "@/src/lib/bien-prix";

import Motion from "@/components/motion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/formatNumber";
import { TexteRiche } from "@/components/texte-riche";
import { LecteurVideo } from "@/components/video/lecteur-video";
import { ModaleVideo } from "@/components/video/modale-video";
import { mediaAnnonce } from "@/src/lib/annonce";
import type { PublicAnnonce } from "@/src/actions/public";
import { RequestVisitButton } from "./request-visit-button";
import {
  DateRangePicker,
  DateField,
  RangeCalendar,
  Label,
} from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";
import dayjs from "dayjs";

import {
  BathIcon,
  BedIcon,
  MapPinIcon,
  Sofa,
  SpaceIcon,
  Users,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import PropertyLocationMap from "../property-location-map";
import PropertyVideo from "../property-video";
import Link from "next/link";
import { useState, useRef, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { BookingRequest } from "@/services/emails/booking_asking.action";
import { createLead } from "@/src/actions/leads";
import { Textarea } from "@/components/ui/textarea";

/**
 * Les lignes de `biens` n'ont pas de type généré : on décrit ici les seules
 * colonnes que la fiche lit réellement, jointures comprises. Tout est nullable
 * comme en base — c'est ce que chacun des replis ci-dessous suppose déjà.
 */
type BienFicheSource = {
  id: string;
  name?: string | null;
  description?: string | null;
  short_description?: string | null;
  address?: string | null;
  adresse_complete?: string | null;
  ville_commune?: string | null;
  pays?: string | null;
  localisation?: string | null;
  image?: string | null;
  lien_video?: string | null;
  area?: string | number | null;
  capacity?: number | null;
  chambre?: number | null;
  salon?: number | null;
  salle_bains?: number | null;
  prix?: number | null;
  prix_month?: number | null;
  /** Migration 0024 : le montant n'est pas publié. */
  prix_sur_demande?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  types_bien?: { name?: string | null } | null;
  services_bien?: {
    name?: string | null;
    est_vente?: boolean | null;
    est_meuble?: boolean | null;
  } | null;
  categories_bien?: {
    name?: string | null;
    est_meuble?: boolean | null;
  } | null;
};

export default function DescriptionSection({
  bien,
  contact,
  annonceVideo,
}: {
  bien: BienFicheSource;
  contact: SiteContact;
  /** Annonce vidéo mettant ce bien en avant, quand l'agence en a publié une. */
  annonceVideo?: PublicAnnonce | null;
}) {
  // La nature du bien vient désormais de colonnes explicites
  // (services_bien.est_vente, categories_bien.est_meuble) : renommer une
  // entrée depuis /admin/taxonomie ne change plus l'affichage du prix.
  const isVente = estVente(bien);
  const isMeuble = estMeuble(bien);

  
  let theme = {
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dot: "bg-emerald-500",
  };

  if (isVente) {
    theme = { badge: "bg-[#F5B324]/10 text-[#F5B324] border-[#F5B324]/20", dot: "bg-[#F5B324]" };
  } else if (isMeuble) {
    theme = { badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", dot: "bg-indigo-500" };
  }

  /**
   * Caractéristiques réellement saisies, dans l'ordre d'affichage.
   *
   * `!= null` et non `&&` : une valeur à 0 est une information — « 0 salon »
   * dit d'un studio qu'il n'a pas de pièce de séjour séparée. C'est l'ABSENCE
   * de saisie qui doit faire disparaître la tuile, pas la valeur zéro.
   *
   * La surface passe en tête : c'est la seule qui vaille pour tous les types de
   * bien, du studio au terrain.
   */
  const caracteristiques = (
    [
      { cle: "area", libelle: "Surface", brut: bien?.area, unite: " m²", Icone: SpaceIcon },
      { cle: "chambre", libelle: "Chambres", brut: bien?.chambre, unite: "", Icone: BedIcon },
      { cle: "salon", libelle: "Salons", brut: bien?.salon, unite: "", Icone: Sofa },
      { cle: "salle_bains", libelle: "Salles de bain", brut: bien?.salle_bains, unite: "", Icone: BathIcon },
      { cle: "capacity", libelle: "Capacité", brut: bien?.capacity, unite: " pers.", Icone: Users },
    ] as const
  )
    .filter((c) => c.brut != null)
    .map((c) => ({
      cle: c.cle,
      libelle: c.libelle,
      valeur: `${c.brut}${c.unite}`,
      Icone: c.Icone,
    }));

  // Le montant et son unité sont choisis ensemble, par le module partagé.
  // Cette page en portait sa propre copie, et l'encadré de droite une
  // troisième : le même bien pouvait annoncer « 0 FCFA » d'un côté et rien du
  // tout de l'autre, à deux centimètres d'écart.
  const prix = prixPrincipal(bien);

  // `adresse_complete` n'était rendue que dans la bulle de la carte, donc
  // invisible dès qu'il manque une coordonnée GPS. Saisie en admin comme
  // l'adresse de la fiche, c'est bien ici qu'elle doit primer. Les trois
  // colonnes du repli sont nullables : la concaténation littérale rendait
  // « Cocody, » sur un bien sans pays et « , » seul sur un bien sans aucune
  // localisation, d'où l'assemblage des seuls morceaux renseignés.
  const addressLine =
    bien?.adresse_complete?.trim() ||
    [bien?.address, bien?.ville_commune, bien?.pays]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ");

  // `biens.localisation` est un champ texte libre et nullable : injecté tel
  // quel dans un href, null donnait `href=""` — soit la page courante rouverte
  // dans un nouvel onglet. On ne rend le lien que pour une URL absolue.
  const mapsHref =
    typeof bien?.localisation === "string" && /^https?:\/\//i.test(bien.localisation)
      ? bien.localisation
      : null;

  return (
    <section className="relative bg-[#FAF5EE] pt-32 sm:pt-40 pb-20">
       <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
         {/* HEADER */}
         <Motion variant="verticalSlideIn">
           <Link href="/properties" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors mb-8 font-medium">
             <ChevronLeft className="w-4 h-4" /> Retour aux propriétés
           </Link>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
             <div>
               <div className="flex flex-wrap items-center gap-3 mb-4">
                 {bien?.services_bien?.name && (
                   <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${theme.badge}`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
                     {bien?.services_bien?.name}
                   </span>
                 )}
                 {bien?.types_bien?.name && (
                   <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white border border-stone-200 text-stone-600">
                     {bien?.types_bien?.name}
                   </span>
                 )}
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-agate font-bold text-secondary leading-tight mb-2">
                 {bien?.name}
               </h1>
               {/* Sans adresse, l'épingle seule laissait croire à un libellé
                   manquant plutôt qu'à une donnée non saisie. */}
               {addressLine &&
                 (mapsHref ? (
                   <Link href={mapsHref} target="_blank" className="flex items-center gap-2 text-stone-500 hover:text-primary transition-colors text-lg">
                     <MapPinIcon className="w-5 h-5 text-primary" />
                     {addressLine}
                   </Link>
                 ) : (
                   <div className="flex items-center gap-2 text-stone-500 text-lg">
                     <MapPinIcon className="w-5 h-5 text-primary" />
                     {addressLine}
                   </div>
                 ))}
             </div>
             
             {/* Un bien sans montant affichait « Loyer mensuel / 0 FCFA /
                 mois » : un prix annoncé, et faux. Le masquer entièrement
                 n'était pas mieux — l'en-tête perdait sa colonne de droite et
                 la ligne du titre se décalait. On dit donc que le prix se
                 demande, ce qui est à la fois vrai et informatif. */}
             <div className="md:text-right">
               <div className="text-sm text-stone-400 font-bold uppercase tracking-widest mb-1">{prix.libelle}</div>
               {prix.surDemande ? (
                 <div className="text-2xl md:text-3xl font-bold text-stone-500">
                   Sur demande
                 </div>
               ) : (
                 <div className="text-3xl md:text-4xl font-bold text-secondary">
                   {formatNumber(prix.montant)} FCFA <span className="text-lg font-normal text-stone-500">{prix.suffixe}</span>
                 </div>
               )}
             </div>
           </div>
         </Motion>

         {/* HERO IMAGE */}
         <Motion variant="verticalSlideIn" animationParams={{ delay: 0.1 }}>
           {/* `biens.image` est nullable : next/image bascule silencieusement en
               `unoptimized` pour une src vide et rend un <img src=""> sur un
               bloc de 400 à 600 px. On ne rend le visuel que s'il existe. */}
           <div className="w-full h-[400px] md:h-[600px] rounded-[32px] overflow-hidden relative shadow-2xl mb-12 bg-stone-200">
             {bien.image && (
               <Image src={bien.image} alt={bien.name ?? ""} fill className="object-cover hover:scale-105 transition-transform duration-1000" priority />
             )}
           </div>
         </Motion>

         {/* MAIN CONTENT GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
           
           {/* LEFT COLUMN: Details */}
           <div className="lg:col-span-8 flex flex-col gap-12">
              
              {/* Features Bar */}
              {/* Le bandeau se rendait même sans rien à montrer : sur quatre
                  biens sur douze — les deux « Appartements », TERRAIN et Villas
                  Duplex —, aucune des cinq caractéristiques n'est saisie, et la
                  page affichait une carte blanche haute de cent pixels entre la
                  photo et la description. Une boîte vide n'est pas un conteneur
                  neutre : elle se lit comme un contenu qui n'a pas chargé.

                  Les tuiles sont assemblées d'abord, rendues ensuite — c'est ce
                  qui rend « n'a rien à dire » vérifiable, plutôt que réparti
                  entre cinq conditions qu'il faut lire ensemble pour conclure. */}
              {caracteristiques.length > 0 && (
                <Motion variant="verticalSlideIn">
                  <div className="flex flex-wrap items-center gap-8 p-6 md:p-8 bg-white rounded-[24px] border border-stone-100 shadow-sm">
                    {caracteristiques.map(({ cle, libelle, valeur, Icone }) => (
                      <div key={cle} className="flex flex-col gap-1">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                          {libelle}
                        </span>
                        <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                          <Icone className="w-5 h-5 text-primary" /> {valeur}
                        </div>
                      </div>
                    ))}
                  </div>
                </Motion>
              )}

              {/* Description */}
              <Motion variant="verticalSlideIn">
                <h3 className="text-3xl font-agate font-bold text-secondary mb-6">À propos de ce bien</h3>
                {/* Le champ se saisit maintenant en markdown depuis l'admin.
                    Injecté tel quel dans un `whitespace-pre-wrap`, un « ## »
                    de titre s'affichait littéralement — et les classes `prose`
                    accolées ne produisaient rien, faute du plugin typography.
                    Même moteur que les articles : il construit des éléments
                    React, jamais du HTML brut. */}
                <div className="text-lg">
                  <TexteRiche
                    source={bien.description || bien.short_description || ""}
                  />
                </div>
              </Motion>

              {/* Aucun bloc « Commodités » : les 28 colonnes de `biens` ne
                  portent ni équipements ni stationnement. La liste qui se
                  trouvait ici était une constante locale de 9 items rendue à
                  l'identique sur chaque bien — la fiche d'un terrain annonçait
                  ascenseur, jacuzzi et piscine. À rétablir le jour où une
                  colonne d'équipements existera. */}

              {/* Video */}
              <PropertyVideo videoUrl={bien.lien_video} poster={bien.image} />

              {/* Map */}
              <Motion variant="verticalSlideIn">
                <h3 className="text-3xl font-agate font-bold text-secondary mb-6 flex items-center gap-2">
                  <MapPinIcon className="h-8 w-8 text-primary" />
                  Localisation
                </h3>
                <div className="rounded-[24px] overflow-hidden border border-stone-200 shadow-md h-[400px]">
                  <PropertyLocationMap 
                    latitude={bien.latitude} 
                    longitude={bien.longitude} 
                    name={bien.name} 
                    address={bien.adresse_complete || bien.address || bien.ville_commune} 
                  />
                </div>
              </Motion>

           </div>

           {/* RIGHT COLUMN: Sticky Form */}
           <div className="lg:col-span-4 relative">
             {/* La vidéo est au-dessus de l'encadré de contact — elle se
                 remarque, et c'est elle qui donne envie d'écrire — mais HORS du
                 bloc collant. Les deux collés ensemble dépassaient la hauteur
                 de l'écran sur un portable, et le bas du formulaire devenait
                 inatteignable : on ne peut pas faire défiler ce qui est collé.
                 Ainsi la vidéo se lit à l'arrivée, puis laisse la place. */}
             {annonceVideo && (
               <Motion variant="verticalSlideIn" animationParams={{ delay: 0.15 }}>
                 <div className="mb-6">
                   <EncartVideoAnnonce annonce={annonceVideo} />
                 </div>
               </Motion>
             )}
             <div className="sticky top-32">
                <Motion variant="verticalSlideIn" animationParams={{ delay: 0.2 }}>
                  <PriceCard bien={bien} contact={contact} isMeuble={isMeuble} isVente={isVente} />
                </Motion>
             </div>
           </div>

         </div>
       </div>
    </section>
  );
}

/**
 * La vidéo de l'annonce, dans la colonne de droite de la fiche.
 *
 * Elle se lit sur place — la colonne est assez large pour ça — et le bouton
 * d'agrandissement ouvre la même vidéo en grand par-dessus la page.
 *
 * Les deux lecteurs ne doivent jamais jouer ensemble : `suspendre` ramène celui
 * de la colonne à son affiche dès que la modale s'ouvre. Sans cela, le visiteur
 * entendrait deux bandes-son décalées d'une seconde sans comprendre d'où vient
 * la seconde.
 *
 * Suspendre plutôt que remonter avec un `key` : le remontage arrachait le
 * déclencheur du DOM pendant que React Aria refermait la modale, et le focus
 * qui devait lui revenir retombait sur `<body>`.
 */
function EncartVideoAnnonce({ annonce }: { annonce: PublicAnnonce }) {
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const media = mediaAnnonce(annonce);

  if (media?.type !== "video") return null;

  const etiquette = annonce.types_annonce?.name ?? "En vidéo";

  return (
    <Card className="w-full overflow-hidden rounded-[32px] border border-stone-100 bg-white shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/50 px-6 py-4">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {etiquette}
          </div>
          <p className="truncate text-sm font-bold text-secondary">
            {annonce.title}
          </p>
        </div>
      </div>

      <div className="p-4">
        <ModaleVideo
          url={media.url}
          affiche={media.affiche}
          titre={annonce.title}
          onChangementOuverture={setModaleOuverte}
          declencheur={(ouvrir) => (
            <LecteurVideo
              suspendre={modaleOuverte}
              url={media.url}
              affiche={media.affiche}
              titre={annonce.title}
              onAgrandir={ouvrir}
            />
          )}
        />
        {annonce.description && (
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-stone-500">
            {annonce.description}
          </p>
        )}
      </div>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="rounded-full w-full bg-secondary hover:bg-secondary/90 text-white shadow-md font-bold h-12">
      {pending ? "Envoi en cours..." : "Envoyer une demande"}
    </Button>
  );
}

/**
 * Période de séjour : exactement le type que le DateRangePicker attend et
 * renvoie — le dériver du composant évite de dépendre de la copie de
 * `@internationalized/date` que react-stately embarque. `null` tant que la
 * plage est incomplète : react-aria garde alors la borne déjà saisie dans son
 * propre état, ce que `onChange={setValue}` lui laisse faire.
 */
type PlageSejour = NonNullable<
  ComponentProps<typeof DateRangePicker>["value"]
> | null;

const PriceCard = ({ bien, contact, isMeuble, isVente }: { bien: BienFicheSource, contact: SiteContact, isMeuble: boolean, isVente: boolean }) => {
  // `bien.prix ?` traitait un montant à 0 comme une absence dans une branche et
  // l'affichait dans l'autre. `montantUtile` tranche une fois pour toutes.
  //
  // `misEnAvant` couvre en plus le cas tordu d'un bien en vente sur lequel
  // seul le loyer mensuel a été saisi : il répond « sur demande » plutôt que de
  // présenter un loyer comme un prix de vente. C'est ce qui permet à la branche
  // « vente » ci-dessous de se passer de tout repli.
  const misEnAvant = prixPrincipal(bien);
  const prixJournalier = montantUtile(bien.prix);
  const prixMensuel = montantUtile(bien.prix_month);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const [value, setValue] = useState<PlageSejour>(null);
  // Compteur de remontage du sélecteur. `setValue(null)` ne vide que la valeur
  // contrôlée : tant que la plage est incomplète, react-aria garde la borne
  // déjà saisie dans son propre état. Sans ce remontage, une date d'arrivée
  // saisie seule resterait affichée dans le champ après un envoi réussi.
  const [sejourKey, setSejourKey] = useState(0);

  async function handleSubmit(formData: FormData) {
    let checkIn;
    let checkOut;
    
    if (isMeuble && value?.start && value?.end) {
      checkIn = dayjs(value.start.toDate(getLocalTimeZone())).format("DD/MM/YYYY");
      checkOut = dayjs(value.end.toDate(getLocalTimeZone())).format("DD/MM/YYYY");
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const guests = Number(formData.get("people") || 1);

    // La demande la plus qualifiée du site — la seule qui porte un `bien_id` —
    // ne passait que par Resend et n'atteignait jamais /admin/leads. On
    // enregistre donc le lead d'abord : l'e-mail n'est plus qu'une
    // notification, dont l'échec ne doit plus faire perdre la demande.
    const leadResult = await createLead({
      source: "contact",
      full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
      email,
      phone,
      message,
      bien_id: bien?.id ?? null,
      source_url:
        typeof window !== "undefined" ? window.location.pathname : null,
      metadata: {
        bien_name: bien?.name ?? null,
        check_in: checkIn ?? null,
        check_out: checkOut ?? null,
        guests,
      },
    });

    const emailResult = await BookingRequest({
      firstName,
      lastName,
      email,
      phone,
      propertyName: bien.name ?? "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      guests,
      message,
      propertyImage: bien.image ?? "",
    });

    // Succès dès que l'un des deux canaux a abouti : l'agence est servie soit
    // par /admin/leads, soit par l'e-mail. Cela neutralise aussi le cas où
    // seul l'accusé de réception AU CLIENT échoue, que BookingRequest remonte
    // aujourd'hui en `{success:false}` alors que l'agence a bien été notifiée.
    if (leadResult.ok || emailResult.success) {
      setStatus("success");
      formRef.current?.reset();
      setValue(null);
      setSejourKey((k) => k + 1);
    } else {
      setStatus("error");
    }
  }

  return (
    <Card className="w-full bg-white shadow-xl rounded-[32px] overflow-hidden border border-stone-100">
      <div className="p-8 pb-6 border-b border-stone-100 bg-stone-50/50">
        {/* C'est ici que s'affichait « PRIX DE VENTE — 0 FCFA » : le repli
            `bien.prix ?? 0` annonçait un montant sur les quatre biens en vente
            dont le prix n'est pas saisi. Un prix inventé est pire qu'un prix
            absent, et zéro est le plus trompeur de tous. */}
        {misEnAvant.surDemande ? (
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Prix</div>
            <h2 className="text-3xl font-bold text-secondary">Sur demande</h2>
            <p className="text-sm text-stone-500 mt-2">
              Le prix de ce bien se communique de vive voix. Écrivez-nous ou
              appelez-nous, nous vous répondons rapidement.
            </p>
          </div>
        ) : isVente ? (
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Prix de vente</div>
            <h2 className="text-3xl font-bold text-secondary">
              {formatNumber(misEnAvant.montant)} <span className="text-xl">FCFA</span>
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {prixMensuel != null ? (
              <div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Loyer mensuel</div>
                <h2 className="text-3xl font-bold text-secondary">
                  {formatNumber(prixMensuel)} <span className="text-xl">FCFA</span>
                  <span className="text-base font-normal text-stone-500"> / mois</span>
                </h2>
              </div>
            ) : null}
            {prixJournalier != null ? (
              <div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Tarif journalier</div>
                <h2 className="text-2xl font-bold text-primary">
                  {formatNumber(prixJournalier)} <span className="text-lg">FCFA</span>
                  <span className="text-sm font-normal text-stone-500"> / jour</span>
                </h2>
              </div>
            ) : null}
          </div>
        )}

      </div>

      <CardContent className="p-8 space-y-6">
        <div>
          <h3 className="font-bold text-secondary mb-4 text-lg">
            Contactez-nous pour ce bien
          </h3>
          <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder="Prénom"
                className="h-11 text-sm rounded-xl bg-stone-50 border-transparent focus:bg-white"
                required
              />
              <Input
                name="lastName"
                placeholder="Nom"
                className="h-11 text-sm rounded-xl bg-stone-50 border-transparent focus:bg-white"
                required
              />
            </div>
            <Input
              name="email"
              placeholder="Adresse email"
              type="email"
              className="h-11 text-sm rounded-xl bg-stone-50 border-transparent focus:bg-white"
              required
            />
            <Input
              name="phone"
              placeholder="Téléphone"
              type="tel"
              className="h-11 text-sm rounded-xl bg-stone-50 border-transparent focus:bg-white"
              required
            />
            
            {isMeuble && (
              <>
                <Input
                  name="people"
                  placeholder="Nombre de personnes"
                  type="number"
                  className="h-11 text-sm rounded-xl bg-stone-50 border-transparent focus:bg-white"
                  required
                />
                <div className="bg-stone-50 p-2 rounded-xl border border-transparent">
                  <DateRangePicker
                    key={sejourKey}
                    value={value}
                    onChange={setValue}
                    isRequired
                    className="w-full"
                  >
                    <Label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 ml-1 block">Période de séjour</Label>
                    <DateField.Group className="rounded-lg bg-white border border-stone-200">
                      <DateField.Input slot="start">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateRangePicker.RangeSeparator />
                      <DateField.Input slot="end">
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix>
                        <DateRangePicker.Trigger>
                          <DateRangePicker.TriggerIndicator />
                        </DateRangePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DateRangePicker.Popover>
                      <RangeCalendar
                        aria-label="Période de séjour"
                        firstDayOfWeek="mon"
                      >
                        <RangeCalendar.Header>
                          <RangeCalendar.NavButton slot="previous" />
                          <RangeCalendar.Heading />
                          <RangeCalendar.NavButton slot="next" />
                        </RangeCalendar.Header>
                        <RangeCalendar.Grid>
                          <RangeCalendar.GridHeader>
                            {(day) => (
                              <RangeCalendar.HeaderCell>
                                {day}
                              </RangeCalendar.HeaderCell>
                            )}
                          </RangeCalendar.GridHeader>
                          <RangeCalendar.GridBody>
                            {(date) => <RangeCalendar.Cell date={date} />}
                          </RangeCalendar.GridBody>
                        </RangeCalendar.Grid>
                      </RangeCalendar>
                    </DateRangePicker.Popover>
                  </DateRangePicker>
                </div>
              </>
            )}
            
            <Textarea
              name="message"
              placeholder="Message ou question"
              className="min-h-[100px] text-sm rounded-xl bg-stone-50 border-transparent focus:bg-white resize-none"
              required
            />
            
            <div className="pt-2 flex flex-col gap-3">
              <SubmitButton />
              
              <Link
                href={contact.whatsappMessageUrl || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "#"}
                target="_blank"
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#25D366] text-base font-bold text-white transition ease-out hover:bg-[#20b958] shadow-sm"
              >
                <span>Contacter sur WhatsApp</span>
              </Link>
              
              <div className="mt-2">
                <RequestVisitButton
                  bienId={bien?.id}
                  bienName={bien?.name ?? null}
                />
              </div>
            </div>
          </form>

          {status === "success" && (
            <div className="mt-4 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200">
              Votre demande a été envoyée avec succès ! Notre équipe vous contactera sous peu.
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
              Une erreur s&apos;est produite. Veuillez réessayer ou nous contacter par téléphone.
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-stone-100">
          <div className="flex items-center space-x-4">
            <Avatar className="w-14 h-14 border border-stone-200 p-1 shadow-sm">
              <AvatarImage
                src="/images/logo.png"
                alt="Agence Mirna"
                className="object-contain"
              />
            </Avatar>
            <div>
              <h4 className="font-bold text-secondary text-sm">Agence Mirna</h4>
              <p className="text-xs text-stone-500 mt-1 font-medium">{contact.phone}</p>
              <p className="text-xs text-stone-500 font-medium">{contact.email}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
