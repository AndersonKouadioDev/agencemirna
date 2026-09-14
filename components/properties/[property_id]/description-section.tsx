"use client";

import type { SiteContact } from "@/src/lib/site-contact";

import Motion from "@/components/motion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/formatNumber";
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
  latitude?: number | null;
  longitude?: number | null;
  types_bien?: { name?: string | null } | null;
  services_bien?: { name?: string | null } | null;
  categories_bien?: { name?: string | null } | null;
};

export default function DescriptionSection({
  bien,
  contact,
}: {
  bien: BienFicheSource;
  contact: SiteContact;
}) {
  const serviceName = (bien?.services_bien?.name || "").toLowerCase();
  const categorieName = (bien?.categories_bien?.name || "").toLowerCase();

  const isVente = serviceName.includes("vente");
  // L'ameublement est porté par `categories_bien` (Meublé / Semi-meublé /
  // Non meublé). Quand la catégorie est renseignée elle tranche SEULE, dans
  // les deux sens : le libellé du service « Location meublée » contient le mot
  // « meublé » et annulait donc une catégorie « Non meublé », rouvrant le
  // sélecteur de dates et le tarif à la nuitée sur un bien vide de meubles.
  // Le service n'est consulté qu'à défaut de catégorie, pour le service
  // générique « Location » qui ne dit pas s'il est meublé.
  const isMeuble = categorieName
    ? categorieName.includes("meubl") && !categorieName.includes("non meubl")
    : serviceName.includes("meublé") ||
      serviceName.includes("courte") ||
      serviceName.includes("vacance");

  
  let theme = {
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dot: "bg-emerald-500",
  };

  if (isVente) {
    theme = { badge: "bg-[#F5B324]/10 text-[#F5B324] border-[#F5B324]/20", dot: "bg-[#F5B324]" };
  } else if (isMeuble) {
    theme = { badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", dot: "bg-indigo-500" };
  }

  // Le montant et son unité doivent être choisis ensemble. Auparavant l'unité
  // était figée par le thème : un bien meublé sans `prix` retombait sur
  // `prix_month` tout en gardant « / nuitée », affichant donc un loyer mensuel
  // à la nuitée — contredit à l'écran par la PriceCard de la même page, qui
  // annonce le même montant « / mois ».
  let priceLabel = "Loyer mensuel";
  let priceSuffix = "/ mois";
  let displayPrice: number | null = null;

  if (isVente) {
    priceLabel = "Prix de vente";
    priceSuffix = "";
    displayPrice = bien.prix ?? null;
  } else if (isMeuble && bien.prix != null) {
    priceLabel = "À partir de";
    priceSuffix = "/ nuitée";
    displayPrice = bien.prix;
  } else if (bien.prix_month != null) {
    displayPrice = bien.prix_month;
  } else if (bien.prix != null) {
    // `prix` est le tarif journalier partout ailleurs sur la fiche.
    priceLabel = "À partir de";
    priceSuffix = "/ nuitée";
    displayPrice = bien.prix;
  }

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
             
             {/* Un bien sans aucun montant saisi affichait « Loyer mensuel /
                 0 FCFA / mois » : le repli `?? 0` annonce un prix aussi faux
                 qu'un prix inventé, et `formatNumber(null)` rendrait de son
                 côté un « FCFA » orphelin. On masque le bloc entier. */}
             {displayPrice != null && (
               <div className="md:text-right">
                 <div className="text-sm text-stone-400 font-bold uppercase tracking-widest mb-1">{priceLabel}</div>
                 <div className="text-3xl md:text-4xl font-bold text-secondary">
                   {formatNumber(displayPrice)} FCFA <span className="text-lg font-normal text-stone-500">{priceSuffix}</span>
                 </div>
               </div>
             )}
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
              <Motion variant="verticalSlideIn">
                <div className="flex flex-wrap items-center gap-8 p-6 md:p-8 bg-white rounded-[24px] border border-stone-100 shadow-sm">
                   {/* `area &&` laissait React rendre le nombre 0 tout seul au
                       milieu du bandeau ; `!= null` aligne la tuile sur ses
                       voisines. Et le nombre nu se lisait mal sans son unité,
                       que l'admin annonce pourtant (« Surface (m²) »). */}
                   {bien?.area != null && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Surface</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <SpaceIcon className="w-5 h-5 text-primary" /> {bien?.area} m²
                       </div>
                     </div>
                   )}
                   {bien?.chambre != null && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Chambres</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <BedIcon className="w-5 h-5 text-primary" /> {bien?.chambre}
                       </div>
                     </div>
                   )}
                   {bien?.salon != null && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Salons</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <Sofa className="w-5 h-5 text-primary" /> {bien?.salon}
                       </div>
                     </div>
                   )}
                   {bien?.salle_bains != null && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Salles de bain</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <BathIcon className="w-5 h-5 text-primary" /> {bien?.salle_bains}
                       </div>
                     </div>
                   )}
                   {bien?.capacity != null && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Capacité</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <Users className="w-5 h-5 text-primary" /> {bien?.capacity} pers.
                       </div>
                     </div>
                   )}
                </div>
              </Motion>

              {/* Description */}
              <Motion variant="verticalSlideIn">
                <h3 className="text-3xl font-agate font-bold text-secondary mb-6">À propos de ce bien</h3>
                <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed whitespace-pre-wrap text-lg">
                  {bien.description || bien.short_description}
                </div>
              </Motion>

              {/* Aucun bloc « Commodités » : les 28 colonnes de `biens` ne
                  portent ni équipements ni stationnement. La liste qui se
                  trouvait ici était une constante locale de 9 items rendue à
                  l'identique sur chaque bien — la fiche d'un terrain annonçait
                  ascenseur, jacuzzi et piscine. À rétablir le jour où une
                  colonne d'équipements existera. */}

              {/* Video */}
              <PropertyVideo videoUrl={bien.lien_video} />

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
        {isVente ? (
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Prix de vente</div>
            <h2 className="text-3xl font-bold text-secondary">
              {formatNumber(bien.prix ?? 0)} <span className="text-xl">FCFA</span>
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {bien.prix_month ? (
              <div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Loyer mensuel</div>
                <h2 className="text-3xl font-bold text-secondary">
                  {formatNumber(bien.prix_month)} <span className="text-xl">FCFA</span>
                  <span className="text-base font-normal text-stone-500"> / mois</span>
                </h2>
              </div>
            ) : null}
            {bien.prix ? (
              <div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Tarif journalier</div>
                <h2 className="text-2xl font-bold text-primary">
                  {formatNumber(bien.prix)} <span className="text-lg">FCFA</span>
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
