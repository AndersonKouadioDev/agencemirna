"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Check, X, Pencil, Trash2, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import {
  upsertTaxonomyEntry,
  deleteTaxonomyEntry,
  type TaxonomyRow,
  type TaxonomyTable,
} from "@/src/actions/admin/taxonomy";

type Brouillon = {
  id?: number;
  name: string;
  /** Nom tel qu'il était à l'ouverture : sert à repérer un renommage. */
  nomInitial: string;
  image: string | null;
  ordre: number | null;
};

const VIDE: Brouillon = { name: "", nomInitial: "", image: null, ordre: null };

/**
 * Seuls les types et les services portent un visuel exploité par le site : le
 * méga-menu l'affiche au survol de l'entrée. Les catégories d'ameublement ne
 * sont montrées nulle part sur la vitrine — ni menu, ni filtre, ni fiche — et
 * le champ Image ne faisait donc que réclamer un travail sans retombée. On le
 * masque pour cette table ; la valeur éventuellement déjà stockée n'est pas
 * effacée, `upsertTaxonomyEntry` ne touchant une colonne que si elle lui est
 * transmise.
 */
const porteUnVisuel = (table: TaxonomyTable) => table !== "categories_bien";

const sansAccent = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Libellé tel que le lisent les fiches : minuscules, accents CONSERVÉS. */
const minuscule = (v: string) => v.trim().toLowerCase();

/**
 * Liens du site qui filtrent le catalogue sur un libellé de service écrit en
 * dur. Le catalogue recoupe sans accent ni casse : les clés sont donc
 * normalisées de la même façon.
 */
const LIENS_CATALOGUE_PAR_SERVICE: Record<string, string[]> = {
  vente: [
    "Le bouton « Voir les biens » de la page /services/vente, qui filtre le catalogue sur ce libellé.",
  ],
  "location meublee": [
    "Le bouton « Voir les biens » de la page /services/location-meublee, qui filtre le catalogue sur ce libellé.",
    "Le bandeau défilant en haut du site (« appartements meublés dès 50 000 FCFA/nuit »), dont le lien filtre le catalogue sur ce libellé.",
  ],
  "gestion locative": [
    "Le bouton « Voir les biens » de la page /services/gestion-immobiliere, qui filtre le catalogue sur ce libellé.",
  ],
  construction: [
    "Le bouton « Voir les biens » de la page /services/construction, qui filtre le catalogue sur ce libellé.",
  ],
};

/**
 * Comportements du site suspendus au libellé EXACT d'une entrée.
 *
 * Plusieurs endroits de la vitrine comparent du texte au lieu de comparer un
 * identifiant, et ils ne normalisent PAS de la même façon — d'où les deux
 * formes du libellé calculées ici :
 *  - les liens vers le catalogue (pages /services/*, bandeau défilant) sont
 *    recoupés sans accent ni casse par le filtre du catalogue ;
 *  - la fiche d'un bien, elle, se contente de passer le libellé en minuscules
 *    puis cherche « vente » ou « meublé » — accent compris. Retirer l'accent
 *    de « Location meublée » suffit donc à refermer le tarif à la nuitée,
 *    alors que le lien du catalogue, lui, continuerait de fonctionner.
 * Un renommage fait dérailler la vitrine sans qu'aucune erreur ne remonte ici.
 * Tant que ces comparaisons portent sur du texte, la seule protection possible
 * depuis cette page est d'avertir avant d'enregistrer.
 */
function referencesEnDur(table: TaxonomyTable, nom: string): string[] {
  const brut = minuscule(nom);
  if (!brut) return [];
  const normalise = sansAccent(nom.trim());
  const refs: string[] = [];

  if (table === "services_bien") {
    refs.push(...(LIENS_CATALOGUE_PAR_SERVICE[normalise] ?? []));
    if (brut.includes("vente")) {
      refs.push(
        "L'affichage d'un prix de vente plutôt que d'un loyer sur la fiche des biens rattachés, déclenché par le mot « vente ».",
      );
    }
    if (
      brut.includes("meublé") ||
      brut.includes("courte") ||
      brut.includes("vacance")
    ) {
      refs.push(
        "L'ouverture du tarif à la nuitée sur les biens sans catégorie d'ameublement, déclenchée par les mots « meublé » (accent compris), « courte » ou « vacance ».",
      );
    }
  }

  if (table === "categories_bien" && brut.includes("meubl")) {
    refs.push(
      brut.includes("non meubl")
        ? "La fermeture du tarif à la nuitée et du sélecteur de dates sur la fiche du bien, obtenue par les mots « non meublé »."
        : "L'ouverture du tarif à la nuitée et du sélecteur de dates sur la fiche du bien, déclenchée par le mot « meublé ».",
    );
  }

  return refs;
}

/**
 * Hôtes acceptés par next/image, avec le préfixe de chemin que chacun impose
 * dans les remotePatterns de next.config.mjs. Contrôler l'hôte seul ne suffit
 * pas : next/image lève aussi quand le chemin sort du motif déclaré, et
 * l'aperçu ferait alors tomber le rendu — exactement ce que ce garde-fou
 * cherche à éviter.
 */
const HOTES_AUTORISES = [
  {
    // L'URL Supabase peut porter un « / » final : on ne garde que l'hôte.
    hote: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, ""),
    prefixe: "/storage/",
  },
  { hote: "i.ytimg.com", prefixe: "/vi/" },
  { hote: "images.unsplash.com", prefixe: "/" },
].filter((h) => h.hote);

const MESSAGE_URL_INVALIDE = `Adresse d'image invalide : indiquez un chemin interne (commençant par /) ou une URL https servie par ${HOTES_AUTORISES.map((h) => h.hote + h.prefixe).join(", ")}.`;

/**
 * Renvoie l'URL à stocker, `null` pour un champ vidé, ou `undefined` si la
 * saisie n'est pas exploitable. L'aperçu passe par next/image, qui lève
 * pendant le rendu (en développement) dès que `new URL(src)` échoue : tant que
 * la valeur n'est pas complète, elle ne doit pas atteindre le brouillon.
 */
function normaliserUrlImage(saisie: string): string | null | undefined {
  const valeur = saisie.trim();
  if (!valeur) return null;
  if (valeur.startsWith("/")) return valeur;
  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:") return undefined;
  const autorise = HOTES_AUTORISES.find((h) => h.hote === url.hostname);
  return autorise && url.pathname.startsWith(autorise.prefixe)
    ? valeur
    : undefined;
}

export function TaxonomyManager({
  table,
  title,
  description,
  items,
}: {
  table: TaxonomyTable;
  title: string;
  description: string;
  items: TaxonomyRow[];
}) {
  const router = useRouter();
  const [brouillon, setBrouillon] = React.useState<Brouillon | null>(null);
  // La saisie manuelle d'URL vit à part du brouillon : elle n'y est reportée
  // qu'une fois complète, sinon chaque frappe alimenterait l'aperçu next/image.
  const [urlManuelle, setUrlManuelle] = React.useState("");
  const [erreurUrl, setErreurUrl] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<number | "nouveau" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const enEdition = brouillon !== null;
  const avecImage = porteUnVisuel(table);

  // Un renommage ne peut pas être refusé — il est parfois légitime — mais il
  // doit être annoncé : le code qui lit ces libellés vit hors de l'admin et ne
  // se met pas à jour tout seul.
  const nomSaisi = brouillon?.name ?? "";
  const refsAvant = referencesEnDur(table, brouillon?.nomInitial ?? "");
  const refsApres = referencesEnDur(table, nomSaisi);
  // Comparaison en minuscules mais accents conservés : aucune des règles du
  // site ne distingue la casse, alors que la fiche d'un bien, elle, cherche
  // « meublé » avec son accent — un accent retiré est un vrai renommage.
  const renomme =
    !!brouillon?.nomInitial &&
    minuscule(brouillon.nomInitial) !== minuscule(nomSaisi);
  const perdues = refsAvant.filter((r) => !refsApres.includes(r));
  const gagnees = refsApres.filter((r) => !refsAvant.includes(r));

  function ouvrirCreation() {
    setError(null);
    setErreurUrl(null);
    setUrlManuelle("");
    setBrouillon({ ...VIDE });
  }

  function ouvrirEdition(row: TaxonomyRow) {
    setError(null);
    setErreurUrl(null);
    setUrlManuelle(row.image ?? "");
    setBrouillon({
      id: row.id,
      name: row.name,
      nomInitial: row.name,
      image: row.image,
      ordre: row.ordre,
    });
  }

  function fermerFormulaire() {
    setBrouillon(null);
    setUrlManuelle("");
    setErreurUrl(null);
  }

  /** Report de la saisie manuelle vers le brouillon (au blur, pas à la frappe). */
  function validerUrlManuelle(): string | null | undefined {
    const valeur = normaliserUrlImage(urlManuelle);
    if (valeur === undefined) {
      setErreurUrl(MESSAGE_URL_INVALIDE);
      return undefined;
    }
    setErreurUrl(null);
    setBrouillon((b) => (b ? { ...b, image: valeur } : b));
    return valeur;
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!brouillon) return;
    // La touche Entrée soumet sans passer par le blur du champ URL : on
    // revalide ici pour ne jamais enregistrer une saisie restée en attente.
    // Sans champ Image, on transmet `undefined` : la colonne est laissée telle
    // quelle plutôt que remise à null.
    const image = avecImage ? validerUrlManuelle() : undefined;
    if (avecImage && image === undefined) return;
    setError(null);
    setBusy(brouillon.id ?? "nouveau");

    const res = await upsertTaxonomyEntry(table, {
      id: brouillon.id,
      name: brouillon.name,
      image,
      ordre: brouillon.ordre,
    });

    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    fermerFormulaire();
    router.refresh();
  }

  async function supprimer(row: TaxonomyRow) {
    if (
      !confirm(
        `Supprimer « ${row.name} » ? Les biens qui l'utilisent empêcheront la suppression.`,
      )
    )
      return;
    setError(null);
    setBusy(row.id);
    const res = await deleteTaxonomyEntry(table, row.id);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
        {!enEdition && (
          <Button type="button" variant="outline" onClick={ouvrirCreation}>
            <Plus className="h-4 w-4 mr-1.5" />
            Ajouter
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {enEdition && brouillon && (
        <form
          onSubmit={enregistrer}
          className="rounded-md border border-stone-200 bg-stone-50/60 p-4 mb-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
            <div className="space-y-1.5">
              <Label>
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                value={brouillon.name}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, name: e.target.value })
                }
                required
                autoFocus
                placeholder="Ex : Villa"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ordre</Label>
              {/*
                `ordre` est NOT NULL en base (migration 0018) : vider le champ
                ne peut pas l'effacer. Sur une entrée existante, la colonne est
                alors laissée telle quelle — le placeholder le dit, plutôt que
                de laisser croire à un rang recalculé.
              */}
              <Input
                type="number"
                value={brouillon.ordre ?? ""}
                onChange={(e) =>
                  setBrouillon({
                    ...brouillon,
                    ordre: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder={brouillon.id ? "inchangé" : "auto"}
              />
            </div>
          </div>

          <p className="text-xs text-neutral-500 -mt-1">
            {avecImage
              ? "L'ordre règle le rang de cette entrée dans le menu du site et dans cette liste."
              : "L'ordre règle le rang de cette entrée dans cette liste."}
          </p>

          {renomme && (perdues.length > 0 || gagnees.length > 0) ? (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-800 space-y-2">
              <p className="font-semibold">
                Renommer «&nbsp;{brouillon.nomInitial}&nbsp;» en «&nbsp;
                {nomSaisi.trim() || "…"}&nbsp;» change le comportement du site.
              </p>
              {perdues.length > 0 && (
                <div>
                  <p className="font-medium">Ne s&apos;appliquera plus :</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {perdues.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {gagnees.length > 0 && (
                <div>
                  <p className="font-medium">S&apos;appliquera désormais :</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {gagnees.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p>
                Ces règles sont écrites dans le code du site : cette page ne
                peut pas les mettre à jour. Prévenez le développeur avant
                d&apos;enregistrer.
              </p>
            </div>
          ) : refsApres.length > 0 ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">
                Ce libellé pilote le site mot pour mot :
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {refsApres.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p>Le modifier demande une intervention sur le code du site.</p>
            </div>
          ) : null}

          {avecImage && (
            <div className="space-y-1.5">
              <Label>Image</Label>
              <ImageUploader
                value={brouillon.image ? [brouillon.image] : []}
                onChange={(urls) => {
                  const url = urls[0] ?? null;
                  setBrouillon({ ...brouillon, image: url });
                  setUrlManuelle(url ?? "");
                  setErreurUrl(null);
                }}
                pathPrefix={`taxonomie/${table}`}
                maxFiles={1}
              />
              <Input
                value={urlManuelle}
                onChange={(e) => setUrlManuelle(e.target.value)}
                onBlur={() => validerUrlManuelle()}
                placeholder="Ou une URL d'image existante"
                className="text-sm"
                aria-invalid={erreurUrl ? true : undefined}
              />
              {erreurUrl ? (
                <p className="text-xs text-red-600">{erreurUrl}</p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Affichée dans le menu du site au survol de cette entrée.
                  L&apos;aperçu n&apos;apparaît qu&apos;une fois
                  l&apos;adresse complète.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={fermerFormulaire}
            >
              <X className="h-4 w-4 mr-1.5" />
              Annuler
            </Button>
            <Button type="submit" disabled={busy !== null}>
              {busy !== null ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Check className="h-4 w-4 mr-1.5" />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune entrée pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {items.map((row) => {
            // Une adresse déjà stockée mais non servable ferait tomber toute la
            // liste : next/image lève pendant le rendu si l'hôte n'est pas
            // déclaré. On la traite comme une absence d'image, en le signalant.
            const apercu = avecImage
              ? normaliserUrlImage(row.image ?? "")
              : null;
            const refs = referencesEnDur(table, row.name);
            return (
            <li key={row.id} className="flex items-center gap-3 py-2.5">
              {avecImage && (
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-stone-100">
                  {apercu ? (
                    <Image
                      src={apercu}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-stone-300">
                      <ImageOff className="h-4 w-4" />
                    </span>
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {row.name}
                </p>
                {avecImage &&
                  (!row.image ? (
                    <p className="text-xs text-amber-700">
                      Sans image : repli générique dans le menu.
                    </p>
                  ) : !apercu ? (
                    <p className="text-xs text-amber-700">
                      Adresse d&apos;image inexploitable : modifiez
                      l&apos;entrée pour la corriger.
                    </p>
                  ) : null)}
                {refs.length > 0 && (
                  <p
                    className="text-xs text-neutral-500"
                    title={refs.join("\n")}
                  >
                    Libellé repris tel quel par le site : à renommer avec
                    précaution.
                  </p>
                )}
              </div>

              <span className="text-xs font-mono text-neutral-400 shrink-0">
                {row.ordre}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => ouvrirEdition(row)}
                  aria-label={`Modifier ${row.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => supprimer(row)}
                  disabled={busy === row.id}
                  aria-label={`Supprimer ${row.name}`}
                >
                  {busy === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
