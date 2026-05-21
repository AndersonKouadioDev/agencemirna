"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLead } from "@/src/actions/leads";

const TYPES = [
  "Appartement",
  "Studio",
  "Villa",
  "Duplex",
  "Maison",
  "Terrain",
  "Entrepôt",
  "Local commercial",
  "Bureau",
  "Autre",
];

const OBJECTIFS = [
  { value: "vente", label: "Vendre" },
  { value: "location", label: "Mettre en location" },
  { value: "gestion", label: "Faire gérer" },
  { value: "curiosite", label: "Connaître la valeur" },
];

export function EstimationForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bienType, setBienType] = React.useState("Appartement");
  const [objectif, setObjectif] = React.useState("vente");
  const [quartier, setQuartier] = React.useState("");
  const [surface, setSurface] = React.useState("");
  const [chambres, setChambres] = React.useState("");
  const [annee, setAnnee] = React.useState("");
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createLead({
      source: "estimation",
      full_name: name,
      email,
      phone,
      message,
      source_url: typeof window !== "undefined" ? window.location.pathname : null,
      metadata: {
        bien_type: bienType,
        objectif,
        quartier: quartier || null,
        surface: surface || null,
        chambres: chambres || null,
        annee_construction: annee || null,
      },
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-5">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary mb-3">
          Demande reçue, merci !
        </h2>
        <p className="text-neutral-700 max-w-md mx-auto mb-6">
          Un expert vous rappelle sous 24h ouvrées pour valider les
          éléments et préparer votre estimation argumentée.
        </p>
        <a
          href={
            process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
            "https://wa.me/22501434831131"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-3 transition-colors"
        >
          Discuter dès maintenant sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <header>
        <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary">
          Décrivez votre bien
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Tous les champs avec * sont obligatoires. Les autres nous aident à
          être plus précis.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Identité */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          Vos coordonnées
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Votre nom" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Aïcha K."
              required
            />
          </Field>
          <Field label="Téléphone (WhatsApp si possible)" required>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 ..."
              required
            />
          </Field>
        </div>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </Field>
      </fieldset>

      {/* Bien */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          Votre bien
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Type de bien" required>
            <select
              value={bienType}
              onChange={(e) => setBienType(e.target.value)}
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm bg-white"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Objectif" required>
            <select
              value={objectif}
              onChange={(e) => setObjectif(e.target.value)}
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm bg-white"
            >
              {OBJECTIFS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Quartier / commune">
          <Input
            value={quartier}
            onChange={(e) => setQuartier(e.target.value)}
            placeholder="Ex : Cocody Riviera, Marcory Zone 4..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Surface (m²)">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="Ex : 120"
            />
          </Field>
          <Field label="Nombre de chambres">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={chambres}
              onChange={(e) => setChambres(e.target.value)}
              placeholder="Ex : 3"
            />
          </Field>
          <Field label="Année de construction">
            <Input
              type="number"
              min={1900}
              max={2030}
              inputMode="numeric"
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              placeholder="Ex : 2018"
            />
          </Field>
        </div>

        <Field label="Précisions complémentaires">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="État général, équipements particuliers, vue, dernières rénovations..."
            rows={4}
          />
        </Field>
      </fieldset>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="rounded-full px-8"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Recevoir mon estimation
        </Button>
        <p className="text-xs text-neutral-500 self-center">
          Vos informations restent confidentielles, jamais partagées avec
          des tiers.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
