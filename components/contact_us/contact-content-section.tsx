"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Phone, Mail } from "lucide-react";
import { useFormStatus } from "react-dom";
import { ContactUs } from "@/services/emails/contact_us.action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="rounded-full" disabled={pending}>
      {pending ? "Envoi en cours..." : "Envoyer un message"}
    </Button>
  );
}

export default function ContactContentSection() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const result = await ContactUs({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    });
    if (result.success) {
      setStatus("success");
      formRef.current?.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <section
      id="hero"
      className="relative isolate py-20 mx-auto max-w-screen-2xl"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row gap-8 bg-gray-50 p-8 rounded-lg">
          <div className="w-full md:w-1/2 pr-8">
            <h2 className="text-3xl font-bold mb-4">Entrer en contact </h2>
            <p className="text-gray-600 mb-6">
              L&apos;Agence Mirna vous accueille dans ses locaux modernes et
              confortables, idéalement situés pour répondre à tous vos besoins
              immobiliers.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-3 text-gray-400" />
                <span>
                  1er étage de l&apos;immeuble Fawaz, Rue Pierre Marie et Currie
                  <br />
                  Marcory Zone 4, Abidjan Côte d&apos;Ivoire
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span>info@agencemirna.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-gray-400" />
                <span>(+225) 27 21 536 231 | (+225) 01 43 483 131 | (+225) 07 03 06 42 06</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    required
                    name="lastName"
                    className="w-full"
                  />
                </div>
                <div className="w-full lg:w-1/2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    required
                    name="firstName"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  required
                  name="email"
                  type="email"
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Téléphone
                </label>
                <Input
                  id="phone"
                  required
                  name="phone"
                  type="tel"
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  className="w-full"
                  rows={4}
                />
              </div>
              <SubmitButton />
              {status === "success" && (
                <p className="text-green-600">
                  Votre message a été envoyé avec succès !
                </p>
              )}
              {status === "error" && (
                <p className="text-red-600">
                  Une erreur s&apos;est produite. Veuillez réessayer.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
