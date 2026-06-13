"use client";

import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { ChevronRightIcon, FacebookIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface IFormInput {
  email: string;
}
type FooterLink = { id: number; title: string; url: string };

const footerLinks: FooterLink[][] = [
  [
    { id: 1, title: "À propos", url: "/about" },
    { id: 2, title: "Contact", url: "/contact_us" },
    { id: 3, title: "Nos propriétés", url: "/properties" },
    { id: 4, title: "Nos services", url: "/services" },
  ],
  [
    { id: 5, title: "Notre équipe", url: "/agents" },
    { id: 6, title: "Promotions", url: "/promotions" },
    { id: 7, title: "WhatsApp", url: "https://wa.me/2250143483131" },
  ],
];

export function SiteFooter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      // Import dynamique pour éviter d'embarquer le module server dans le bundle client si non utilisé
      const { createLead } = await import("@/src/actions/leads");
      const result = await createLead({
        source: "newsletter",
        email: data.email,
        source_url:
          typeof window !== "undefined" ? window.location.pathname : null,
      });
      if (result.ok) {
        toast.success("Inscription enregistrée. Nous vous tiendrons informé.");
        reset();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="footer"
      className="relative overflow-hidden isolate py-32 mx-auto"
    >
      <div className="container mx-auto px-4 z-[1]">
        {/* Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 py-8 md:py-16">
          <div className="order-2 max-w-xl mx-auto lg:order-1 relative z-[1] flex items-center justify-center overflow-hidden rounded-3xl">
            <Image
              src="/images/biens/bien3.jpg"
              alt="Discover Exclusive Real Estate Opportunities - Houz X Webflow Template"
              className="object-cover w-full h-full hover:scale-105 transition-all duration-300"
              width={1000}
              height={1000}
            />
          </div>
          <div className="order-1 lg:order-2  max-w-2xl mx-auto relative z-[1] flex flex-col border border-primary justify-center items-start p-8 md:p-16 bg-white rounded-3xl shadow-xl">
            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl text-secondary md:text-3xl lg:text-4xl text-center lg:text-left font-agate font-bold mb-4">
                Découvrez des opportunités immobilières exclusives !
              </h2>
              <div className="text-sm md:text-base mb-4">
                <p>
                  Abonnez-vous à la newsletter de l&apos;Agence Mirna et soyez
                  le premier à découvrir :
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>🏠 Nos nouvelles propriétés exclusives</li>
                  <li>
                    💡 Des conseils d&apos;experts pour vos projets immobiliers
                  </li>
                  <li>
                    📊 Les dernières tendances du marché immobilier à Abidjan
                  </li>
                  <li>🎁 Des offres spéciales réservées à nos abonnés</li>
                </ul>
              </div>
              <p className="text-sm md:text-base mb-4">
                Rejoignez notre communauté d&apos;investisseurs et de
                propriétaires avisés. Recevez chaque mois une sélection
                soigneusement curatée d&apos;informations précieuses directement
                dans votre boîte mail.
              </p>
              <form
                id="wf-form-Footer-V1-Form"
                name="wf-form-Footer-V1-Form"
                method="get"
                className="flex flex-col lg:flex-row items-center gap-4"
              >
                <Input
                  className="w-full max-w-md p-4 text-black rounded-full"
                  name="Email"
                  placeholder="Enter your email"
                  type="email"
                  id="email-footer"
                  required
                />
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full max-w-md bg-white flex-1 rounded-full"
                >
                  Souscrire
                </Button>
              </form>
              <div className="mt-4 text-left hidden">
                <div className="flex items-center gap-2">
                  <div className="text-green-500">✔</div>
                  <div className="text-lg">
                    Thanks for joining our newsletter.
                  </div>
                </div>
              </div>
              <div className="mt-4 hidden text-left text-red-500">
                Oops! Something went wrong.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-[1] flex flex-col py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-start justify-start gap-y-5">
            <a href="#" className="flex items-center gap-3">
              <Image
                className="h-8 w-8"
                alt="Logo"
                src="/images/icon.png"
                width={100}
                height={100}
              />
              <h1 className="text-xl text-white">AGENCE MIRNA</h1>
            </a>
            <div className="flex items-center gap-2">
              <Link
                href="#"
                className="text-white hover:text-primary group bg-black rounded-full p-2"
              >
                <InstagramLogoIcon className="h-4 w-4 transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12" />
              </Link>
              <Link
                href="#"
                className="text-white hover:text-primary group bg-black rounded-full p-2"
              >
                <FacebookIcon className="h-4 w-4 transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12" />
              </Link>
            </div>
            <p className="text-sm tracking-tight text-white hover:text-primary sm:text-center transition-all duration-300 ease-out">
              © AGENCE MIRNA 2024. Tous droits réservés. | Développé par{" "}
              <Link
                target="_blank"
                href="https://lunion-lab.com"
                className="underline hover:text-violet-500"
              >
                LUINION-LAB
              </Link>
            </p>
          </div>
          <div className="pt-5 md:w-1/2">
            <div className="flex items-center justify-between gap-x-3 px-0 lg:px-10">
              {footerLinks.map((column, columnIndex) => (
                <ul key={columnIndex} className="flex flex-col gap-y-2">
                  {column.map((link) => (
                    <li
                      key={link.id}
                      className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug font-medium text-white duration-200 hover:text-primary"
                    >
                      <a href={link.url}>{link.title}</a>
                      <ChevronRightIcon className="h-4 w-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-1/2 absolute bottom-0 left-0 right-0 bg-secondary overflow-hidden"></div>
    </section>
  );
}
