"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "../../_components/image-uploader";
import { CommuneAdminRow } from "@/src/actions/admin/communes";
import {
  upsertQuartier,
  type QuartierRow,
} from "@/src/actions/admin/quartiers";
import {
  MESSAGE_URL_IMAGE_INVALIDE,
  normaliserUrlImage,
} from "@/src/lib/image-url";

/**
 * Formulaire de quartier.
 *
 * Un quartier n'a plus de rendu propre sur la vitrine : il n'y sert que de
 * filtre (/properties?quartier=<id>) et d'entrée du dropdown Localisation,
 * qui n'affiche que son nom. Badge, description longue et « mis en avant sur
 * la home » ont donc été retirés : la section « Nos quartiers » qu'ils
 * alimentaient n'existe plus, et les trois champs ne sortaient nulle part.
 */
export function QuartierForm({
  row,
  communes = [],
  communeParDefaut,
}: {
  row?: QuartierRow;
  communes?: CommuneAdminRow[];
  /** Pré-sélection quand on arrive depuis la fiche d'une commune. */
  communeParDefaut?: string;
}) {
  const router = useRouter();
  const isEdit = !!row;

  const [name, setName] = React.useState(row?.name ?? "");
  const preselection = !row
    ? communes.find((c) => c.id === communeParDefaut)
    : undefined;
  const [commune, setCommune] = React.useState(
    row?.commune ?? preselection?.nom ?? "",
  );
  const [communeId, setCommuneId] = React.useState(
    row?.commune_id ?? preselection?.id ?? "",
  );
  const [tagline, setTagline] = React.useState(row?.tagline ?? "");
  const [searchQuery, setSearchQuery] = React.useState(row?.search_query ?? "");
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);
  const [ordre, setOrdre] = React.useState<number | null>(row?.ordre ?? null);

  const [imageUrls, setImageUrls] = React.useState<string[]>(
    row?.image && row.image.startsWith("/images/") ? [] : row?.image ? [row.image] : [],
  );
  const [imageAlt, setImageAlt] = React.useState(
    row?.image && row.image.startsWith("/images/") ? row.image : "",
  );

  // Quartiers créés avant la table `communes` : on retrouve la commune par
  // correspondance de nom. C'est une valeur dérivée, pas un effet de bord —
  // la calculer pendant le rendu évite un second rendu au chargement.
  const communeIdEffectif =
    communeId ||
    (commune
      ? (communes.find(
          (c) => c.nom.trim().toLowerCase() === commune.trim().toLowerCase(),
        )?.id ?? "")
      : "");

  // Choisir une commune synchronise aussi le libellé texte `commune`,
  // utilisé par la recherche publique.
  function handleCommuneChange(id: string) {
    setCommuneId(id);
    const c = communes.find((x) => x.id === id);
    if (c) setCommune(c.nom);
  }

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Nombre de photos en cours d'envoi, remonté par <ImageUploader>. Le
  // composant n'appelle `onChange` qu'une fois le lot complet monté :
  // enregistrer pendant ce temps soumettait la liste INCHANGÉE, donc aucune
  // des photos déposées, et laissait les fichiers déjà montés orphelins.
  const [photosEnEnvoi, setPhotosEnEnvoi] = React.useState(0);

  // Ce libellé-ci est rendu hors d'un <Field> : sans `htmlFor`, il ne
  // désignait aucun champ, contrairement à son jumeau du formulaire d'annonce.
  const idUrlImage = React.useId();

  // Identifiant de brouillon figé au premier rendu : le calculer dans un
  // useMemo appelait une fonction impure, et un re-rendu pouvait déplacer
  // le dossier de destination des images en cours d'envoi.
  const [brouillonId] = React.useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10),
  );
  const pathPrefix = row?.id ? `quartiers/${row.id}` : `quartiers/draft-${brouillonId}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // La touche Entrée soumet le formulaire même bouton désactivé : la garde
    // doit vivre ici aussi, sinon l'image en vol serait perdue — et le
    // formulaire refuserait l'enregistrement, faute d'image.
    if (photosEnEnvoi > 0) {
      setError(
        "L'image est encore en cours d'envoi. Patientez la fin de l'envoi avant d'enregistrer.",
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    // Une adresse saisie à la main n'est pas contrainte : stockée telle quelle,
    // next/image la refuse ensuite et l'aperçu d'administration casse. Même
    // garde que le formulaire d'annonce, seul à l'appliquer jusqu'ici.
    const urlManuelle = imageUrls[0] ? null : normaliserUrlImage(imageAlt);
    if (urlManuelle === undefined) {
      setError(MESSAGE_URL_IMAGE_INVALIDE);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const finalImage = imageUrls[0] || urlManuelle || "";
    if (!finalImage) {
      setError("Une image est obligatoire (upload ou URL existante).");
      setSubmitting(false);
      return;
    }

    const result = await upsertQuartier({
      id: row?.id,
      name,
      commune,
      commune_id: communeIdEffectif || null,
      tagline: tagline || null,
      image: finalImage,
      search_query: searchQuery || null,
      is_active: isActive,
      ordre: ordre ?? undefined,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    // /admin/quartiers rebondit sur /admin/geographie en perdant la query
    // string : le flash de confirmation n'arrivait jamais. Et une création
    // annonçait « Modification enregistrée » faute de distinguer les deux cas.
    router.push(`/admin/geographie?flash=${isEdit ? "saved" : "created"}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/geographie"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux communes &amp; quartiers
        </Link>
        <Button type="submit" disabled={submitting || photosEnEnvoi > 0}>
          {submitting || photosEnEnvoi > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {photosEnEnvoi > 0
            ? "Envoi de l'image…"
            : isEdit
              ? "Enregistrer"
              : "Créer le quartier"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? `${row?.name} · ${row?.commune}` : "Nouveau quartier"}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Identité</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom du quartier" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Riviera"
                  required
                />
              </Field>
              {/* L'étiquette vise l'un ou l'autre des deux champs de repli :
                  l'enfant fonction est le seul moyen de lui transmettre
                  l'identifiant. */}
              <Field label="Commune" required>
                {(idCommune) =>
                  communes.length > 0 ? (
                    <>
                      <select
                        id={idCommune}
                        value={communeIdEffectif}
                        onChange={(e) => handleCommuneChange(e.target.value)}
                        required
                        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="" disabled>
                          Choisir une commune…
                        </option>
                        {communes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom}
                            {c.is_active ? "" : " (inactive)"}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-neutral-500">
                        Gérées dans{" "}
                        <Link href="/admin/geographie" className="underline">
                          Communes &amp; quartiers
                        </Link>
                        .
                      </p>
                    </>
                  ) : (
                    <>
                      <Input
                        id={idCommune}
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        placeholder="Ex : Cocody"
                        required
                      />
                      <p className="mt-1 text-[11px] text-amber-600">
                        Aucune commune enregistrée :{" "}
                        <Link
                          href="/admin/communes/nouveau"
                          className="underline"
                        >
                          créez-en une
                        </Link>{" "}
                        pour rattacher proprement ce quartier.
                      </p>
                    </>
                  )
                }
              </Field>
            </div>

            <Field label="Accroche">
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex : Le prestige résidentiel"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Rappel interne : elle identifie le quartier dans la liste
                d&apos;administration. Le site, lui, n&apos;affiche que son nom.
              </p>
            </Field>

            <Field label="Mot-clé recherche (optionnel)">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Si vide, seul le nom du quartier est reconnu"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Second libellé accepté par les anciens liens
                /properties?location=… : renseignez « Riviera » sur un quartier
                nommé « Riviera Bonoumin » pour que les deux mènent ici.
              </p>
            </Field>

            <Field label="Ordre d'affichage">
              <Input
                type="number"
                min={0}
                step={1}
                value={ordre ?? ""}
                onChange={(e) =>
                  setOrdre(e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="auto"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Du plus petit au plus grand : c&apos;est l&apos;ordre des
                quartiers dans le dropdown Localisation. Laissez vide à la
                création pour placer le quartier en fin de liste ; en
                modification, un champ vidé conserve le rang actuel.
              </p>
            </Field>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Image</h2>
            <p className="text-xs text-neutral-500">
              Vignette de repérage dans la liste d&apos;administration. Elle
              reste obligatoire tant que la colonne est NOT NULL en base.
            </p>
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              onUploadingChange={setPhotosEnEnvoi}
              pathPrefix={pathPrefix}
              maxFiles={1}
              disabled={submitting}
            />
            {photosEnEnvoi > 0 && (
              <p className="text-xs text-primary font-medium">
                Envoi en cours : l&apos;enregistrement est bloqué tant que
                l&apos;image n&apos;est pas montée.
              </p>
            )}
            <div className="pt-4 border-t border-stone-200">
              <Label
                htmlFor={idUrlImage}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2 block"
              >
                Ou réutiliser une image existante (URL)
              </Label>
              <Input
                id={idUrlImage}
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Ex : /images/biens/bien6.jpg"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-secondary">Publication</h2>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  Quartier actif
                </span>
                <span className="block text-xs text-neutral-500">
                  Proposé dans le dropdown Localisation et dans les filtres du
                  catalogue.
                </span>
              </span>
            </label>
          </section>
        </div>
      </div>
    </form>
  );
}

/**
 * L'identifiant généré n'était transmis à aucun enfant : cliquer l'étiquette
 * ne focalisait rien et un lecteur d'écran annonçait un champ sans nom. On le
 * pose sur le premier élément rendu — les enfants suivants ne sont que des
 * textes d'aide — ou on le confie à l'appelant via un enfant fonction quand la
 * cible dépend d'une alternative.
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
    <div>
      <Label htmlFor={cible} className="mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {contenu}
    </div>
  );
}
