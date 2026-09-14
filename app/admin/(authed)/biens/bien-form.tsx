"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/admin/address-autocomplete";
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
  adresse_complete: string;
  latitude: string;
  longitude: string;
  lien_video: string;
  ville_commune: string;
  pays: string;
  localisation: string;
  type_bien_id: string;
  service_bien_id: string;
  categorie_bien_id: string;
  commune_id: string;
  quartier_id: string;
  area: string;
};

/**
 * Valeur sentinelle des trois <Select> de catégorisation : Radix interdit une
 * `SelectItem` de valeur vide, et sans option de remise à zéro un type choisi
 * par erreur ne pouvait plus être retiré. Retraduite en chaîne vide au submit,
 * puis en `null` côté action.
 */
const AUCUN = "none";

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
    adresse_complete: bien?.adresse_complete ?? "",
    latitude: bien?.latitude?.toString() ?? "",
    longitude: bien?.longitude?.toString() ?? "",
    lien_video: bien?.lien_video ?? "",
    ville_commune: bien?.ville_commune ?? "",
    pays: bien?.pays ?? "Côte d'Ivoire",
    localisation: bien?.localisation ?? "",
    type_bien_id: bien?.type_bien_id?.toString() ?? "",
    service_bien_id: bien?.service_bien_id?.toString() ?? "",
    categorie_bien_id: bien?.categorie_bien_id?.toString() ?? "",
    // UUID : pas de .toString(), ce sont déjà des chaînes.
    commune_id: bien?.commune_id ?? "",
    quartier_id: bien?.quartier_id ?? "",
    area: bien?.area?.toString() ?? "",
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

  // Nombre de photos en cours d'envoi, remonté par <ImageUploader>. Le
  // composant n'appelle `onChange` qu'une fois l'envoi terminé : enregistrer
  // pendant ce temps soumettait la liste INCHANGÉE, donc aucune des photos
  // déposées, et laissait les fichiers déjà montés orphelins dans le bucket.
  const [photosEnEnvoi, setPhotosEnEnvoi] = React.useState(0);

  // Identifiant d'un bien créé dont la galerie a échoué : le bien existe déjà,
  // un second envoi doit le modifier et non en créer un doublon.
  const [idCree, setIdCree] = React.useState<string | null>(null);

  // pathPrefix : pour l'édition, le bien.id (chemin stable) ; pour la
  // création, un brouillon figé au premier rendu — le calculer dans un
  // useMemo appelait une fonction impure, et un re-rendu pouvait déplacer le
  // dossier de destination des images en cours d'envoi. Non persisté : le
  // chemin réel est stocké dans `storage_path`, rien n'est à renommer ensuite.
  //
  // Les photos retirées avant enregistrement sont effacées du bucket par
  // <ImageUploader> : le diff de `upsertBien` ne peut pas les voir, elles
  // n'ont jamais eu de ligne dans `bien_images`. Seul un formulaire abandonné
  // sans retirer ses photos laisse encore des fichiers sous `biens/draft-*`.
  const [brouillonId] = React.useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10),
  );
  // `idCree` compte autant que `bien.id` : après un échec partiel, le bien
  // EXISTE en base, et les photos du second essai doivent être rangées sous son
  // identifiant définitif plutôt que dans le dossier de brouillon. Le
  // changement de dossier est sans risque pour un envoi en cours : la garde
  // `photosEnEnvoi > 0` interdit l'enregistrement qui renseigne `idCree`.
  const idBien = bien?.id ?? idCree;
  const pathPrefix = idBien ? `biens/${idBien}` : `biens/draft-${brouillonId}`;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Quartiers de la commune choisie.
   * Double critère : le rattachement par `commune_id` est la référence, mais
   * les quartiers saisis avant la migration n'ont que le libellé texte.
   */
  const quartiersDeLaCommune = React.useMemo(() => {
    if (!form.commune_id) return [];
    const commune = reference.communes.find((c) => c.id === form.commune_id);
    return reference.quartiers.filter(
      (q) =>
        q.commune_id === form.commune_id ||
        (!q.commune_id &&
          !!commune &&
          (q.commune ?? "").trim().toLowerCase() ===
            commune.nom.trim().toLowerCase()),
    );
  }, [form.commune_id, reference.communes, reference.quartiers]);

  /**
   * Changer de commune vide le quartier — sinon un quartier d'une autre
   * commune resterait sélectionné — et synchronise le libellé `ville_commune`,
   * sur lequel la recherche plein texte de la vitrine s'appuie encore.
   */
  function handleCommuneChange(id: string) {
    const commune = reference.communes.find((c) => c.id === id);
    setForm((prev) => ({
      ...prev,
      commune_id: id,
      quartier_id: "",
      ville_commune: commune ? commune.nom : prev.ville_commune,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // La touche Entrée soumet le formulaire même bouton désactivé : la garde
    // doit vivre ici aussi, sinon les photos en vol seraient perdues.
    if (photosEnEnvoi > 0) {
      setError(
        "Des photos sont encore en cours d'envoi. Patientez la fin de l'envoi avant d'enregistrer.",
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await upsertBien({
      id: bien?.id ?? idCree ?? undefined,
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
      latitude: parseNumber(form.latitude),
      longitude: parseNumber(form.longitude),
      type_bien_id: parseInt(form.type_bien_id, 10) || null,
      service_bien_id: parseInt(form.service_bien_id, 10) || null,
      categorie_bien_id: parseInt(form.categorie_bien_id, 10) || null,
      commune_id: form.commune_id || null,
      quartier_id: form.quartier_id || null,
      adresse_complete: form.adresse_complete || null,
      lien_video: form.lien_video || null,
      area: parseNumber(form.area),
      is_active: isActive,
      image_urls: imageUrls,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Le bien est enregistré mais une écriture sur `bien_images` a échoué :
    // rediriger sur « Bien créé » annoncerait une galerie qui n'existe pas.
    if (result.data.erreurPhotos) {
      setIdCree(result.data.id);
      setError(result.data.erreurPhotos);
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
          <Button type="submit" disabled={submitting || photosEnEnvoi > 0}>
            {submitting || photosEnEnvoi > 0 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-1.5">
              {photosEnEnvoi > 0
                ? "Envoi des photos…"
                : submitting
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
              onUploadingChange={setPhotosEnEnvoi}
              pathPrefix={pathPrefix}
              maxFiles={20}
              disabled={submitting}
            />
            {photosEnEnvoi > 0 && (
              <p className="text-xs text-primary font-medium">
                Envoi en cours : l&apos;enregistrement est bloqué tant que les
                photos ne sont pas toutes montées.
              </p>
            )}
          </Section>

          {/* Section : Localisation */}
          <Section title="Localisation">
            <Field label="Adresse">
              {(id) => (
                <AddressAutocomplete
                  id={id}
                  value={form.address}
                  onChange={(val) => update("address", val)}
                  placeholder="Recherchez une adresse..."
                  onPlaceSelected={(place) => {
                    if (place.geometry?.location) {
                      update("latitude", place.geometry.location.lat().toString());
                      update("longitude", place.geometry.location.lng().toString());
                    }
                    if (place.url) {
                      update("localisation", place.url);
                    }
                  
                    // Extract city and country
                    if (place.address_components) {
                      let city = "";
                      let country = "";
                    
                      for (const component of place.address_components) {
                        const types = component.types;
                        if (types.includes("locality")) {
                          city = component.long_name;
                        } else if (types.includes("administrative_area_level_2") && !city) {
                          city = component.long_name;
                        } else if (types.includes("administrative_area_level_1") && !city) {
                          city = component.long_name;
                        }
                      
                        if (types.includes("country")) {
                          country = component.long_name;
                        }
                      }
                    
                      // Google renvoie une ville en texte libre. On tente de la
                      // rapprocher d'une commune connue pour pré-sélectionner le
                      // select ; sans cela on pouvait enregistrer commune_id =
                      // Cocody avec ville_commune = « Abidjan », ce qui contredit
                      // le filtrage de la vitrine.
                      if (city) {
                        const n = (v: string) =>
                          v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
                        const match = reference.communes.find(
                          (c) => n(c.nom) === n(city),
                        );
                        if (match) handleCommuneChange(match.id);
                        else update("ville_commune", city);
                      }
                      if (country) update("pays", country);
                    }
                  }}
                />
              )}
            </Field>
            <p className="text-xs text-stone-500 -mt-1">L&apos;auto-complétion remplit automatiquement la ville, le pays, le lien et les coordonnées GPS.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Commune">
                {reference.communes.length > 0 ? (
                  <select
                    value={form.commune_id}
                    onChange={(e) => handleCommuneChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">— Aucune —</option>
                    {reference.communes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                        {c.is_active ? "" : " (inactive)"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-stone-500 border border-dashed border-stone-300 rounded-md px-3 py-2">
                    Aucune commune enregistrée.{" "}
                    <Link href="/admin/communes/nouveau" className="underline">
                      Créez-en une
                    </Link>{" "}
                    pour pouvoir rattacher ce bien.
                  </p>
                )}
              </Field>
              <Field label="Quartier">
                <select
                  value={form.quartier_id}
                  onChange={(e) => update("quartier_id", e.target.value)}
                  disabled={!form.commune_id || quartiersDeLaCommune.length === 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">— Aucun —</option>
                  {quartiersDeLaCommune.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                      {q.is_active ? "" : " (inactif)"}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-500 mt-1">
                  {!form.commune_id
                    ? "Choisissez d'abord une commune."
                    : quartiersDeLaCommune.length === 0
                      ? "Aucun quartier rattaché à cette commune."
                      : "Le quartier affine le filtrage sur la vitrine."}
                </p>
              </Field>
            </div>
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
            <Field label="Adresse complète (remplace l'adresse sur la fiche)">
              <Input
                value={form.adresse_complete}
                onChange={(e) => update("adresse_complete", e.target.value)}
                placeholder="Laissez vide pour utiliser l'adresse ci-dessus"
              />
            </Field>
            <Field label="Lien de la visite vidéo">
              <Input
                type="url"
                value={form.lien_video}
                onChange={(e) => update("lien_video", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-stone-500 mt-1">
                Affiche la section « Visite en vidéo » sur la fiche du bien.
                Seuls les liens YouTube sont lus (watch?v=, youtu.be, /shorts/,
                /embed/, /live/) : un lien d&apos;un autre hébergeur laisse la
                section masquée.
              </p>
            </Field>
            <Field label="Lien Google Maps">
              <Input
                type="url"
                value={form.localisation}
                onChange={(e) => update("localisation", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </Field>

            {/* Coordonnées GPS pour la vue carte sur /properties */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <Input
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(e) => update("latitude", e.target.value)}
                  placeholder="5.3360"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(e) => update("longitude", e.target.value)}
                  placeholder="-4.0083"
                  inputMode="decimal"
                />
              </Field>
            </div>
            <p className="text-xs text-neutral-500 -mt-1">
              Coordonnées GPS pour la vue carte. Astuce : sur Google Maps,
              clic droit sur le point exact → copier les coordonnées.
              Le bien n&apos;apparaît sur la carte que si les deux champs sont
              renseignés.
            </p>
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
              {(id) => (
                <Select
                  value={form.type_bien_id || AUCUN}
                  onValueChange={(v) =>
                    update("type_bien_id", v === AUCUN ? "" : v)
                  }
                >
                  <SelectTrigger id={id} className="bg-white">
                    <SelectValue placeholder="Choisir un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUCUN}>— Aucun type —</SelectItem>
                    {reference.types.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label="Service (transaction)">
              {(id) => (
                <Select
                  value={form.service_bien_id || AUCUN}
                  onValueChange={(v) =>
                    update("service_bien_id", v === AUCUN ? "" : v)
                  }
                >
                  <SelectTrigger id={id} className="bg-white">
                    <SelectValue placeholder="Vente ou Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUCUN}>— Aucun service —</SelectItem>
                    {reference.services.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label="Ameublement">
              {(id) => (
                <Select
                  value={form.categorie_bien_id || AUCUN}
                  onValueChange={(v) =>
                    update("categorie_bien_id", v === AUCUN ? "" : v)
                  }
                >
                  <SelectTrigger id={id} className="bg-white">
                    <SelectValue placeholder="Meublé ou Non meublé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUCUN}>— Aucun ameublement —</SelectItem>
                    {reference.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
              <Field label="Surface (m²)">
                <Input
                  type="number"
                  value={form.area}
                  onChange={(e) => update("area", e.target.value)}
                  placeholder="Ex : 120"
                  min="0"
                  step="0.01"
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
        <Button type="submit" disabled={submitting || photosEnEnvoi > 0}>
          {submitting || photosEnEnvoi > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {photosEnEnvoi > 0
              ? "Envoi des photos…"
              : submitting
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

/**
 * `htmlFor` pointait dans le vide : l'identifiant généré n'était transmis à
 * aucun enfant, si bien que cliquer sur l'étiquette ne focalisait rien et
 * qu'un lecteur d'écran annonçait des champs sans nom. On le pose sur le
 * premier élément rendu — le champ de saisie —, ou on le laisse au parent via
 * un enfant fonction quand la cible est imbriquée (SelectTrigger).
 */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode | ((id: string) => React.ReactNode);
}) {
  const id = React.useId();

  // `cible` reste indéfini tant qu'aucun enfant n'a reçu l'identifiant : un
  // Field sans élément à étiqueter ne doit pas laisser le libellé pointer dans
  // le vide. Un Fragment est sauté — lui poser un `id` n'aurait aucun effet
  // sinon un avertissement React.
  let cible: string | undefined;
  let contenu: React.ReactNode;
  if (typeof children === "function") {
    cible = id;
    contenu = children(id);
  } else {
    contenu = React.Children.map(children, (child) => {
      if (
        cible !== undefined ||
        !React.isValidElement(child) ||
        child.type === React.Fragment
      ) {
        return child;
      }
      const element = child as React.ReactElement<{ id?: string }>;
      cible = element.props.id ?? id;
      return element.props.id ? element : React.cloneElement(element, { id });
    });
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={cible} className="text-xs font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div>{contenu}</div>
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
