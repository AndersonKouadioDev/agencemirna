"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "../../_components/image-uploader";
import {
  upsertBien,
  type BienAdminRow,
  type BienImage,
  type ReferenceData,
} from "@/src/actions/admin/biens";

export interface BienFormProps {
  /** Si présent : mode édition. Sinon : mode création. */
  bien?: BienAdminRow;
  images?: BienImage[];
  reference: ReferenceData;
}

type FormState = {
  name: string;
  short_description: string;
  description: string;
  prix: string;
  prix_month: string;
  chambre: string;
  salon: string;
  salle_bains: string;
  capacity: string;
  address: string;
  ville_commune: string;
  pays: string;
  localisation: string;
  type_bien_id: string;
  service_bien_id: string;
  categorie_bien_id: string;
};

export function BienForm({ bien, images = [], reference }: BienFormProps) {
  const router = useRouter();
  const isEdit = !!bien;

  const [form, setForm] = React.useState<FormState>({
    name: bien?.name ?? "",
    short_description: bien?.short_description ?? "",
    description: bien?.description ?? "",
    prix: bien?.prix?.toString() ?? "",
    prix_month: bien?.prix_month?.toString() ?? "",
    chambre: bien?.chambre?.toString() ?? "",
    salon: bien?.salon?.toString() ?? "",
    salle_bains: bien?.salle_bains?.toString() ?? "",
    capacity: bien?.capacity?.toString() ?? "",
    address: bien?.address ?? "",
    ville_commune: bien?.ville_commune ?? "Marcory-Abidjan",
    pays: bien?.pays ?? "Côte d'Ivoire",
    localisation: bien?.localisation ?? "",
    type_bien_id: bien?.type_bien_id?.toString() ?? "",
    service_bien_id: bien?.service_bien_id?.toString() ?? "",
    categorie_bien_id: bien?.categorie_bien_id?.toString() ?? "",
  });

  const [imageUrls, setImageUrls] = React.useState<string[]>(
    images.map((img) => img.url),
  );

  // Toggle activation (par défaut true pour les nouveaux biens)
  const [isActive, setIsActive] = React.useState<boolean>(
    bien?.is_active ?? true,
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // pathPrefix : pour l'édition, utilise le bien.id (chemin stable).
  // Pour la création, un random temporaire (les fichiers orphelins seront
  // nettoyés au save côté upsertBien via diff).
  const pathPrefix = React.useMemo(() => {
    if (bien?.id) return `biens/${bien.id}`;
    // Random non persisté pour la création : sera remplacé par bien_id réel
    // après save (mais comme on stocke storage_path en DB, pas besoin
    // de renommer les fichiers).
    return `biens/draft-${typeof crypto !== "undefined" ? crypto.randomUUID().slice(0, 8) : Date.now()}`;
  }, [bien?.id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertBien({
      id: bien?.id,
      name: form.name,
      short_description: form.short_description || null,
      description: form.description || null,
      prix: parseNumber(form.prix),
      prix_month: parseNumber(form.prix_month),
      chambre: parseNumber(form.chambre),
      salon: parseNumber(form.salon),
      salle_bains: parseNumber(form.salle_bains),
      capacity: parseNumber(form.capacity),
      address: form.address || null,
      ville_commune: form.ville_commune || null,
      pays: form.pays || null,
      localisation: form.localisation || null,
      type_bien_id: parseInt(form.type_bien_id, 10) || null,
      service_bien_id: parseInt(form.service_bien_id, 10) || null,
      categorie_bien_id: parseInt(form.categorie_bien_id, 10) || null,
      is_active: isActive,
      image_urls: imageUrls,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Redirection avec flash
    router.push(`/admin/biens?flash=${isEdit ? "updated" : "created"}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 hover:bg-stone-100 text-neutral-600"
          >
            <Link href="/admin/biens" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? form.name || "(sans nom)" : "Nouveau bien"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-1.5">
              {submitting
                ? "Enregistrement…"
                : isEdit
                  ? "Enregistrer"
                  : "Créer le bien"}
            </span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : 2/3 (champs principaux + photos) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section : Identité du bien */}
          <Section title="Identité">
            <Field label="Nom du bien" required>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Appartement Genève"
                required
              />
            </Field>

            <Field label="Description courte">
              <Input
                value={form.short_description}
                onChange={(e) => update("short_description", e.target.value)}
                placeholder="Une phrase qui résume le bien"
                maxLength={200}
              />
              <Hint>{form.short_description.length}/200 caractères</Hint>
            </Field>

            <Field label="Description complète">
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Description détaillée affichée sur la fiche du bien"
                rows={6}
              />
            </Field>
          </Section>

          {/* Section : Photos */}
          <Section
            title="Photos"
            subtitle="La première photo sera utilisée comme couverture sur le site. Glissez-déposez pour réorganiser."
          >
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              pathPrefix={pathPrefix}
              maxFiles={20}
            />
          </Section>

          {/* Section : Localisation */}
          <Section title="Localisation">
            <Field label="Adresse">
              <Input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Ex: Rue du 7 décembre"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville / Commune">
                <Input
                  value={form.ville_commune}
                  onChange={(e) => update("ville_commune", e.target.value)}
                />
              </Field>
              <Field label="Pays">
                <Input
                  value={form.pays}
                  onChange={(e) => update("pays", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Lien Google Maps">
              <Input
                type="url"
                value={form.localisation}
                onChange={(e) => update("localisation", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </Field>
          </Section>
        </div>

        {/* Colonne droite : 1/3 (publication + catégorisation + prix + caractéristiques) */}
        <div className="space-y-6">
          {/* Section : Publication */}
          <Section
            title="Publication"
            subtitle="Activer ou désactiver l'affichage du bien sur le site public."
          >
            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md p-2 -m-2 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="flex-1">
                <span
                  className={`block text-sm font-medium ${isActive ? "text-neutral-900" : "text-neutral-500"}`}
                >
                  {isActive ? "Bien actif (visible)" : "Bien désactivé"}
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  {isActive
                    ? "Visible sur agencemirna.com et dans le catalogue /properties"
                    : "Masqué du site public : toujours visible et éditable ici en admin"}
                </span>
              </span>
            </label>
          </Section>

          {/* Section : Catégorisation */}
          <Section title="Catégorisation">
            <Field label="Type de bien">
              <Select
                value={form.type_bien_id}
                onValueChange={(v) => update("type_bien_id", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {reference.types.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Service (transaction)">
              <Select
                value={form.service_bien_id}
                onValueChange={(v) => update("service_bien_id", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Vente ou Location" />
                </SelectTrigger>
                <SelectContent>
                  {reference.services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Ameublement">
              <Select
                value={form.categorie_bien_id}
                onValueChange={(v) => update("categorie_bien_id", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Meublé ou Non meublé" />
                </SelectTrigger>
                <SelectContent>
                  {reference.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          {/* Section : Prix */}
          <Section title="Prix">
            <Field label="Prix (FCFA)">
              <Input
                type="number"
                value={form.prix}
                onChange={(e) => update("prix", e.target.value)}
                placeholder="60000"
                min="0"
              />
            </Field>
            <Field label="Prix mensuel (FCFA)">
              <Input
                type="number"
                value={form.prix_month}
                onChange={(e) => update("prix_month", e.target.value)}
                placeholder="Si différent du prix"
                min="0"
              />
              <Hint>
                Laisser vide si non applicable (vente, location courte durée)
              </Hint>
            </Field>
          </Section>

          {/* Section : Caractéristiques */}
          <Section title="Caractéristiques">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chambres">
                <Input
                  type="number"
                  value={form.chambre}
                  onChange={(e) => update("chambre", e.target.value)}
                  min="0"
                />
              </Field>
              <Field label="Salons">
                <Input
                  type="number"
                  value={form.salon}
                  onChange={(e) => update("salon", e.target.value)}
                  min="0"
                />
              </Field>
              <Field label="Salles de bain">
                <Input
                  type="number"
                  value={form.salle_bains}
                  onChange={(e) => update("salle_bains", e.target.value)}
                  min="0"
                />
              </Field>
              <Field label="Capacité">
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => update("capacity", e.target.value)}
                  placeholder="personnes"
                  min="1"
                />
              </Field>
            </div>
          </Section>
        </div>
      </div>

      {/* Footer actions (sticky pour les longs forms) */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/85 backdrop-blur border-t border-stone-200 px-6 lg:px-8 py-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          asChild
          className="hover:bg-stone-100 border-stone-200"
        >
          <Link href="/admin/biens">Annuler</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer le bien"}
          </span>
        </Button>
      </div>
    </form>
  );
}

// ---------- Sous-composants présentation ----------

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
      <header>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
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
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-neutral-500 mt-1">{children}</p>;
}

// ---------- Helpers ----------

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}
