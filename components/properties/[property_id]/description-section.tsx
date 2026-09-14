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
  CarIcon,
  MapPinIcon,
  SpaceIcon,
  Flower2Icon,
  PenToolIcon,
  ShirtIcon,
  TvIcon,
  UtensilsCrossedIcon,
  WavesIcon,
  WifiIcon,
  AirVentIcon,
  ArrowUpDownIcon,
  Users,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react";
import Image from "next/image";
import PropertyLocationMap from "../property-location-map";
import PropertyVideo from "../property-video";
import Link from "next/link";
import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { BookingRequest } from "@/services/emails/booking_asking.action";
import { Textarea } from "@/components/ui/textarea";

export default function DescriptionSection({
  bien,
  contact,
}: {
  bien: any;
  contact: SiteContact;
}) {
  const serviceName = (bien?.services_bien?.name || "").toLowerCase();
  
  const isVente = serviceName.includes("vente");
  const isMeuble = serviceName.includes("meublé") || serviceName.includes("courte") || serviceName.includes("vacance");
  
  let theme = {
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dot: "bg-emerald-500",
    priceLabel: "Loyer mensuel",
    priceSuffix: "/ mois"
  };

  if (isVente) {
    theme = { badge: "bg-[#F5B324]/10 text-[#F5B324] border-[#F5B324]/20", dot: "bg-[#F5B324]", priceLabel: "Prix de vente", priceSuffix: "" };
  } else if (isMeuble) {
    theme = { badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", dot: "bg-indigo-500", priceLabel: "À partir de", priceSuffix: "/ nuitée" };
  }

  const displayPrice = isVente ? bien.prix : (isMeuble ? (bien.prix || bien.prix_month) : (bien.prix_month || bien.prix));

  const amenities = [
    { icon: AirVentIcon, text: "Climatisation" },
    { icon: TvIcon, text: "Télévision" },
    { icon: UtensilsCrossedIcon, text: "Lave-vaisselle" },
    { icon: ArrowUpDownIcon, text: "Ascenseur" },
    { icon: Flower2Icon, text: "Jardin" },
    { icon: WifiIcon, text: "Internet" },
    { icon: WavesIcon, text: "Jacuzzi" },
    { icon: ShirtIcon, text: "Buanderie" },
    { icon: PenToolIcon, text: "Piscine" },
  ];

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
               <Link href={bien.localisation ?? ""} target="_blank" className="flex items-center gap-2 text-stone-500 hover:text-primary transition-colors text-lg">
                 <MapPinIcon className="w-5 h-5 text-primary" />
                 {bien?.address ? `${bien.address}, ` : ''}{bien?.ville_commune}, {bien?.pays}
               </Link>
             </div>
             
             <div className="md:text-right">
               <div className="text-sm text-stone-400 font-bold uppercase tracking-widest mb-1">{theme.priceLabel}</div>
               <div className="text-3xl md:text-4xl font-bold text-secondary">
                 {formatNumber(displayPrice ?? 0)} FCFA <span className="text-lg font-normal text-stone-500">{theme.priceSuffix}</span>
               </div>
             </div>
           </div>
         </Motion>

         {/* HERO IMAGE */}
         <Motion variant="verticalSlideIn" animationParams={{ delay: 0.1 }}>
           <div className="w-full h-[400px] md:h-[600px] rounded-[32px] overflow-hidden relative shadow-2xl mb-12">
             <Image src={bien.image ?? ""} alt={bien.name} fill className="object-cover hover:scale-105 transition-transform duration-1000" priority />
           </div>
         </Motion>

         {/* MAIN CONTENT GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
           
           {/* LEFT COLUMN: Details */}
           <div className="lg:col-span-8 flex flex-col gap-12">
              
              {/* Features Bar */}
              <Motion variant="verticalSlideIn">
                <div className="flex flex-wrap items-center gap-8 p-6 md:p-8 bg-white rounded-[24px] border border-stone-100 shadow-sm">
                   {bien?.area && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Surface</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <SpaceIcon className="w-5 h-5 text-primary" /> {bien?.area}
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
                   {bien?.salle_bains != null && (
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Salles de bain</span>
                       <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                         <BathIcon className="w-5 h-5 text-primary" /> {bien?.salle_bains}
                       </div>
                     </div>
                   )}
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Garages</span>
                     <div className="flex items-center gap-2 text-secondary font-semibold text-lg">
                       <CarIcon className="w-5 h-5 text-primary" /> 1
                     </div>
                   </div>
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

              {/* Amenities */}
              <Motion variant="verticalSlideIn">
                <h3 className="text-3xl font-agate font-bold text-secondary mb-6">Commodités</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <amenity.icon className="w-5 h-5" />
                      </div>
                      <span className="text-stone-700 font-medium">{amenity.text}</span>
                    </div>
                  ))}
                </div>
              </Motion>

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
                  <PriceCard bien={bien} contact={contact} isMeuble={isMeuble} theme={theme} displayPrice={displayPrice} isVente={isVente} />
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

const PriceCard = ({ bien, contact, isMeuble, theme, displayPrice, isVente }: { bien: any, contact: SiteContact, isMeuble: boolean, theme: any, displayPrice: number, isVente: boolean }) => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const [value, setValue] = useState<any>({
    start: null,
    end: null,
  });

  async function handleSubmit(formData: FormData) {
    let checkIn;
    let checkOut;
    
    if (isMeuble && value?.start && value?.end) {
      checkIn = dayjs(value.start.toDate(getLocalTimeZone())).format("DD/MM/YYYY");
      checkOut = dayjs(value.end.toDate(getLocalTimeZone())).format("DD/MM/YYYY");
    }

    const result = await BookingRequest({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      propertyName: bien.name,
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      guests: Number(formData.get("people") || 1),
      message: formData.get("message") as string,
      propertyImage: bien.image,
    });

    if (result.success) {
      setStatus("success");
      formRef.current?.reset();
      setValue({
        start: null,
        end: null,
      });
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
                href={contact.whatsappUrl || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "#"}
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
              Une erreur s'est produite. Veuillez réessayer ou nous contacter par téléphone.
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
