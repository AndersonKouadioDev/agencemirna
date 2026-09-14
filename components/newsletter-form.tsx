"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { createLead } from "@/src/actions/leads";

/**
 * Formulaire d'abonnement du pied de page.
 *
 * Le bloc était un simple `<div>` : l'input n'avait ni `name` ni état et le
 * bouton n'appartenait à aucun `<form>`, si bien que l'adresse saisie n'était
 * jamais transmise. `createLead` accepte déjà la source `newsletter` (et la
 * dispense du nom), il ne manquait que le branchement.
 */
function BoutonAbonnement() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      className="bg-[#1B3C35] hover:bg-[#152e29] text-white rounded-full px-6 shrink-0"
    >
      {pending ? "..." : "S'abonner"}
    </Button>
  );
}

export default function NewsletterForm() {
  const [statut, setStatut] = useState<"idle" | "success" | "error">("idle");
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setMessageErreur(null);
    const resultat = await createLead({
      source: "newsletter",
      email: (formData.get("email") as string) || null,
      source_url:
        typeof window !== "undefined" ? window.location.pathname : null,
    });
    if (resultat.ok) {
      setStatut("success");
      formRef.current?.reset();
    } else {
      setStatut("error");
      setMessageErreur(resultat.error);
    }
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="flex items-center bg-white rounded-full p-1.5 border border-stone-200 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Votre adresse email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Votre email"
          className="bg-transparent border-none outline-none text-sm w-full px-4 text-stone-600 placeholder:text-stone-400"
        />
        <BoutonAbonnement />
      </form>

      <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-xs">
        {statut === "success" && (
          <span className="text-primary font-semibold">
            Merci, votre inscription est enregistrée.
          </span>
        )}
        {statut === "error" && (
          <span className="text-destructive font-semibold">
            {messageErreur ?? "Inscription impossible pour le moment."}
          </span>
        )}
      </p>
    </div>
  );
}
