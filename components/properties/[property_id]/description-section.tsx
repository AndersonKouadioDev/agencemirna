"use client";

import Motion from "@/components/motion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/formatNumber";
import { DateRangePicker } from "@nextui-org/date-picker";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { BookingRequest } from "@/services/emails/booking_asking.action";
import { Textarea } from "@/components/ui/textarea";

/**
 * DescriptionSection component
 *
 * This component displays the description of a property.
 * It includes a back button to return to the properties page,
 * a gallery of images, and detailed information about the property.
 *
 * @param {Object} bien - The property data object.
 * @param {string} bien.image - The URL of the property image.
 * @returns
 */

export default function DescriptionSection({ bien }: { bien: any }) {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 isolate pt-32 pb-20 mx-auto max-w-screen-2xl"
    >
      <div className="container relative w-full">
        <Link
          href="/properties"
          className="flex items-center gap-2 mb-4 bg-white w-fit p-2 rounded-full shadow-md"
        >
          <ChevronLeft className="size-4" />
          <p className="text-sm font-medium">{"Retour"}</p>
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.6fr] lg:grid-cols-[1fr_0.42fr] gap-4 md:gap-8">
          <div className="lg:justify-self-end w-full max-w-screen-lg">
            <Motion variant="verticalSlideIn">
              <div className="flex flex-col justify-center items-center max-h-[682px] relative overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src={bien.image ?? ""}
                  alt="Real Estate Firm Image - Houz X Webflow Template"
                  className="object-cover w-full h-full flex-1 inline-block align-middle max-w-full hover:scale-105 transition-all duration-300"
                  width={514}
                  height={514}
                />
              </div>
            </Motion>
            <div className="flex flex-col divide-y-2 divide-gray-400 gap-16 mt-16">
              <div className="flex flex-col gap-4">
                <Motion variant="verticalSlideIn">
                  <Link
                    href={bien.localisation ?? ""}
                    target="_blank"
                    className="flex items-center mb-2 hover:text-primary hover:underline transition-all duration-300"
                  >
                    <MapPinIcon className="mr-2 size-4 md:size-6" />

                    <div className="text-base md:text-lg font-medium text-gray-600">
                      {bien?.address +
                        " | " +
                        bien?.ville_commune +
                        ", " +
                        bien?.pays}
                    </div>
                  </Link>
                </Motion>
                <Motion variant="verticalSlideIn">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-agate font-bold">
                    {`${bien?.types_bien?.name} ${bien?.name}`},
                    {bien?.types_bien?.id > 1
                      ? ` ${bien?.chambre + bien?.salon} pièces`
                      : undefined}
                  </h3>
                  <p className="text-base md:text-lg mt-2 whitespace-pre-wrap">
                    {bien.short_description}
                  </p>
                </Motion>
                <Motion variant="verticalSlideIn">
                  <div className="flex flex-wrap gap-8 md:gap-14">
                    {bien?.area && (
                      <div className="flex items-center gap-1">
                        <SpaceIcon className="mr-2 size-4 md:size-6" />
                        <span className="text-gray-600 md:text-lg font-semibold">
                          {bien?.area}
                        </span>
                      </div>
                    )}
                    {bien?.chambre && (
                      <div className="flex items-center gap-1">
                        <BedIcon className="mr-2 size-4 md:size-6" />
                        <span className="text-gray-600 md:text-lg font-semibold">
                          {bien?.chambre}
                        </span>
                      </div>
                    )}
                    {bien?.salle_bains && (
                      <div className="flex items-center gap-1">
                        <BathIcon className="mr-2 size-4 md:size-6" />
                        <span className="text-gray-600 md:text-lg font-semibold">
                          {bien?.salle_bains}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <CarIcon className="mr-2 size-4 md:size-6" />
                      <span className="text-gray-600 md:text-lg font-semibold">
                        {1}
                      </span>
                    </div>
                    {bien?.capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="mr-2 size-4 md:size-6" />
                        <span className="text-gray-600 md:text-lg font-semibold">
                          {bien?.capacity}
                        </span>
                      </div>
                    )}
                  </div>
                </Motion>
              </div>
              <div className="flex flex-col gap-4 pt-16">
                <Motion variant="verticalSlideIn">
                  <h3 className="text-2xl font-agate md:text-3xl lg:text-4xl font-semibold">
                    {"À propos de la propriété"}
                  </h3>
                  <p className="text-base md:text-lg whitespace-pre-wrap">
                    {bien?.description}
                  </p>
                </Motion>
              </div>
              <div className="flex flex-col gap-4 pt-16">
                <Motion variant="verticalSlideIn">
                  <h3 className="text-2xl font-agate md:text-3xl lg:text-4xl font-semibold">
                    {"Commodités de la propriété"}
                  </h3>
                </Motion>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[
                    {
                      icon: AirVentIcon,
                      text: "Climatisation",
                    },
                    {
                      icon: TvIcon,
                      text: "Télévision",
                    },
                    {
                      icon: UtensilsCrossedIcon,
                      text: "Lave-vaisselle",
                    },
                    {
                      icon: ArrowUpDownIcon,
                      text: "Ascenseur",
                    },
                    {
                      icon: Flower2Icon,
                      text: "Jardin",
                    },
                    { icon: WifiIcon, text: "Internet" },
                    { icon: WavesIcon, text: "Jacuzzi" },
                    { icon: ShirtIcon, text: "Buanderie" },
                    { icon: PenToolIcon, text: "Piscine" },
                  ].map((item, index) => (
                    <Motion
                      key={index}
                      variant="verticalSlideIn"
                      animationParams={{ delay: 0.1 * index }}
                    >
                      <div className="text-center flex flex-col items-center justify-center py-10 relative">
                        <div className="w-10 p-2 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                          <item.icon className="size-4 md:size-6" />
                        </div>
                        <div className="text-sm md:text-lg font-medium ">
                          {item.text}
                        </div>
                      </div>
                    </Motion>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 md:sticky md:top-10 self-start">
            <div className="max-w-2xl mx-auto md:sticky md:top-0 z-[1] pt-10">
              <Motion>
                <PriceCard bien={bien} />
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
    <Button type="submit" className="rounded-full w-full" disabled={pending}>
      {pending ? "Envoi en cours..." : "Envoyer une demande"}
    </Button>
  );
}

const PriceCard = ({ bien }: { bien: any }) => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const [value, setValue] = useState<any>({
    start: null,
    end: null,
  });

  async function handleSubmit(formData: FormData) {
    const result = await BookingRequest({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      propertyName: bien.name,
      checkIn: dayjs(value.start.toDate(getLocalTimeZone())).format(
        "DD/MM/YYYY"
      ), // À ajouter si nécessaire
      checkOut: dayjs(value.end.toDate(getLocalTimeZone())).format(
        "DD/MM/YYYY"
      ), // À ajouter si nécessaire
      guests: Number(formData.get("people")),
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
    <Card className="w-full mx-auto max-w-sm p-4 md:p-8 bg-white shadow-md rounded-3xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {formatNumber(bien.prix ?? 0)} FCFA
          <span className="text-gray-400"> / nuitée</span>
        </h2>
        <p className="text-gray-500">
          Propriété en {bien?.services_bien?.name}
        </p>
      </div>

      <CardContent className="p-0 space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">
            Contactez-nous pour recevoir plus d&apos;informations
          </h3>
          <form ref={formRef} action={handleSubmit} className="space-y-2">
            <Input
              name="firstName"
              placeholder="Prénom"
              className="h-9 text-sm rounded-full"
              required
            />
            <Input
              name="lastName"
              placeholder="Nom"
              className="h-9 text-sm rounded-full"
              required
            />
            <Input
              name="email"
              placeholder="Adresse email"
              type="email"
              className="h-9 text-sm rounded-full"
              required
            />
            <Input
              name="phone"
              placeholder="Téléphone"
              type="tel"
              className="h-9 text-sm rounded-full"
              required
            />
            <Input
              name="people"
              placeholder="Nombre de personnes"
              type="number"
              className="h-9 text-sm rounded-full"
              required
            />
            <DateRangePicker
              variant="bordered"
              label="Période de séjour"
              isRequired
              value={value}
              onChange={setValue}
              calendarProps={{
                classNames: {
                  base: "bg-background",
                  headerWrapper: "pt-4 bg-background",
                  prevButton: "border-1 border-default-200 rounded-small",
                  nextButton: "border-1 border-default-200 rounded-small",
                  gridHeader:
                    "bg-background shadow-none border-b-1 border-default-100",
                  cellButton: [
                    "data-[today=true]:bg-default-100 data-[selected=true]:bg-gray-100 rounded-small",
                    // start (pseudo)
                    "data-[range-start=true]:before:rounded-l-small",
                    "data-[selection-start=true]:before:rounded-l-small",
                    // end (pseudo)
                    "data-[range-end=true]:before:rounded-r-small",
                    "data-[selection-end=true]:before:rounded-r-small",
                    // start (selected)
                    "data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:rounded-small",
                    // end (selected)
                    "data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:rounded-small",
                  ],
                },
              }}
            />
            <Textarea
              name="message"
              placeholder="Message"
              className="h-9 text-sm rounded-md"
              required
            />
            <SubmitButton />
          </form>
          {status === "success" && (
            <p className="text-green-600 text-sm mt-2">
              Votre demande a été envoyée avec succès !
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm mt-2">
              Une erreur s&apos;est produite. Veuillez réessayer.
            </p>
          )}
        </div>

        <div className="pt-2">
          <h3 className="font-semibold text-sm mb-2">Contactez l&apos;agent</h3>
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border border-primary p-1">
              <AvatarImage
                src="/images/logo.png"
                alt="Sahara Carson"
                className="object-contain"
              />
            </Avatar>
            <div>
              <p className="text-xs text-gray-600">(225) 01 43 483 131</p>
              <p className="text-xs text-gray-600">info@agencemirna.com</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
