"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChampPiege, useAntiRobot } from "@/components/anti-robot";
import { deposerAvis } from "@/src/actions/avis";
import { cn } from "@/lib/utils";

const LIBELLES_NOTE = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent"];

/** Mois courant au format « 2026-11 », valeur par défaut du séjour. */
function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function FormulaireAvis({
  bienId,
  jeton,
}: {
  bienId: string;
  jeton: string;
}) {
  const [note, setNote] = React.useState(0);
  const [survol, setSurvol] = React.useState(0);
  const [envoi, setEnvoi] = React.useState(false);
  const [envoye, setEnvoye] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const { piegeRef, controle } = useAntiRobot();

  async function envoyer(formData: FormData) {
    setErreur(null);
    if (note === 0) {
      setErreur("Choisissez une note de 1 à 5 étoiles.");
      return;
    }
    setEnvoi(true);
    const resultat = await deposerAvis({
      bien_id: bienId,
      jeton,
      nom: String(formData.get("nom") ?? ""),
      email: String(formData.get("email") ?? ""),
      note,
      commentaire: String(formData.get("commentaire") ?? ""),
      mois_sejour: String(formData.get("mois_sejour") ?? "") || null,
      consentement: formData.get("consentement") === "on",
      anti_robot: controle(),
    });
    setEnvoi(false);
    if (resultat.ok) {
      setEnvoye(true);
    } else {
      setErreur(resultat.error);
    }
  }

  if (envoye) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-stone-100">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-agate text-3xl font-bold text-secondary mb-3">
          Merci pour votre avis !
        </h2>
        <p className="text-neutral-600 leading-relaxed">
          Il sera publié sur notre site après relecture par l&apos;équipe. Si
          nous vous répondons, vous recevrez notre réponse par e-mail.
        </p>
      </div>
    );
  }

  const affichee = survol || note;

  return (
    // `onSubmit` plutôt que `action` : React vide un formulaire `action` après
    // chaque envoi, même refusé, et le client perdrait son commentaire.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void envoyer(new FormData(e.currentTarget));
      }}
      className="relative space-y-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-stone-100"
    >
      <ChampPiege ref={piegeRef} />

      <fieldset>
        <legend className="text-sm font-semibold text-secondary mb-3">
          Votre note <span className="text-red-500">*</span>
        </legend>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setSurvol(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setSurvol(n)}>
              <input
                type="radio"
                name="note"
                value={n}
                checked={note === n}
                onChange={() => setNote(n)}
                className="sr-only"
                aria-label={`${n} étoile${n > 1 ? "s" : ""} : ${LIBELLES_NOTE[n]}`}
              />
              <Star
                className={cn(
                  "h-10 w-10 transition-colors",
                  n <= affichee ? "fill-amber-400 text-amber-400" : "text-stone-300",
                )}
              />
            </label>
          ))}
          <span className="ml-3 text-sm font-semibold text-neutral-600" aria-hidden="true">
            {LIBELLES_NOTE[affichee]}
          </span>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="avis-commentaire">
          Votre commentaire <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="avis-commentaire"
          name="commentaire"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Le logement, l'accueil, le quartier… ce qui vous a plu et ce que nous pourrions améliorer."
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="avis-nom">
            Votre nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="avis-nom"
            name="nom"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avis-mois">Mois du séjour</Label>
          <Input
            id="avis-mois"
            name="mois_sejour"
            type="month"
            defaultValue={moisCourant()}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avis-email">
          Votre e-mail <span className="text-red-500">*</span>
        </Label>
        <Input
          id="avis-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 rounded-xl"
        />
        <p className="text-xs text-neutral-500">
          Jamais publié : il sert seulement à vous envoyer notre réponse.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-neutral-600">
        <input
          type="checkbox"
          name="consentement"
          required
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span>
          J&apos;accepte que mon avis soit publié sur le site de l&apos;Agence
          Mirna avec mon prénom et l&apos;initiale de mon nom.
        </span>
      </label>

      {erreur && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {erreur}
        </p>
      )}

      <Button
        type="submit"
        disabled={envoi}
        className="h-12 w-full rounded-full text-base font-bold"
      >
        {envoi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Envoyer mon avis
      </Button>
    </form>
  );
}
