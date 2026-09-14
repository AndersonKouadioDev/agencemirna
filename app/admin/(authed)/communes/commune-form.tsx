
"use client";
import React, { useId, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import { CommuneFormData, CommuneAdminRow, upsertCommuneAndRedirect } from "@/src/actions/admin/communes";
import {
  MESSAGE_URL_IMAGE_INVALIDE,
  normaliserUrlImage,
} from "@/src/lib/image-url";

function slugify(text: string) {
  // NB : l'ancienne classe [^w\-] signifiait « tout sauf la lettre w »,
  // ce qui vidait le slug de toutes les communes (« Cocody » -> "").
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents (Attécoubé -> Attecoube)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CommuneForm({ item }: { item?: CommuneAdminRow }) {
  const isEdit = !!item;
  const [nom, setNom] = useState(item?.nom || "");
  const [slugSaisi, setSlugSaisi] = useState(item?.slug || "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  // Seuls les champs de présentation réellement rendus sur la vitrine sont
  // saisissables : la carte « Communes phares » n'affiche que le nom,
  // l'accroche et l'image. Badge, description et terme de recherche ont été
  // retirés — aucune page ne les lisait, et le placeholder du terme de
  // recherche promettait un repli qui n'existait pas.
  const [tagline, setTagline] = useState(item?.tagline || "");
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);
  const [ordre, setOrdre] = useState<number | null>(item?.ordre ?? null);
  const [imageUrls, setImageUrls] = useState<string[]>(
    item?.image ? [item.image] : [],
  );
  const [imageAltUrl, setImageAltUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Nombre d'images en cours d'envoi, remonté par <ImageUploader>. Le composant
  // n'appelle `onChange` qu'une fois le lot complet monté : enregistrer pendant
  // ce temps soumettait la liste INCHANGÉE, donc aucune des images déposées, et
  // laissait les fichiers déjà montés orphelins dans le bucket.
  const [photosEnEnvoi, setPhotosEnEnvoi] = useState(0);
  // Les libellés n'avaient aucun `htmlFor` : les cliquer ne focalisait rien et
  // un lecteur d'écran annonçait des champs sans nom. Un préfixe unique suffit,
  // les suffixes distinguant les champs.
  const idChamp = useId();
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  // Tant que l'admin n'a pas édité le slug, c'est une valeur DÉRIVÉE du nom :
  // la calculer pendant le rendu évite l'aller-retour d'un useEffect, qui
  // affichait brièvement l'ancien slug après chaque frappe.
  const slug = autoSlug ? slugify(nom) : slugSaisi;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // La touche Entrée soumet le formulaire même bouton désactivé : la garde
    // doit vivre ici aussi, sinon l'image en vol serait perdue.
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
    const urlManuelle = imageUrls[0] ? null : normaliserUrlImage(imageAltUrl);
    if (urlManuelle === undefined) {
      setError(MESSAGE_URL_IMAGE_INVALIDE);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const data: CommuneFormData = {
      id: item?.id,
      nom,
      slug,
      is_active: isActive,
      ordre: ordre ?? undefined,
      tagline: tagline.trim() || null,
      image: imageUrls[0] || urlManuelle,
      is_featured: isFeatured,
    };
    const result = await upsertCommuneAndRedirect(data);
    if (!result.ok) { setError(result.error); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl pt-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0"><Link href="/admin/geographie"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <MapPin className="h-5 w-5 text-neutral-400" />
          {isEdit ? "Modifier la commune" : "Nouvelle commune"}
        </h1>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-6">{error}</div>}
      <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idChamp}-nom`}>Nom de la commune <span className="text-red-500">*</span></Label>
          <Input id={`${idChamp}-nom`} value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Ex: Cocody" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idChamp}-slug`}>Slug (URL) <span className="text-red-500">*</span></Label>
          <Input id={`${idChamp}-slug`} value={slug} onChange={(e) => { setSlugSaisi(e.target.value); setAutoSlug(false); }} required placeholder="ex: cocody" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idChamp}-ordre`}>Ordre d&apos;affichage</Label>
          <Input
            id={`${idChamp}-ordre`}
            type="number"
            min={0}
            step={1}
            value={ordre ?? ""}
            onChange={(e) =>
              setOrdre(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="auto"
          />
          <p className="text-xs text-neutral-500">
            Du plus petit au plus grand. Décide de l&apos;ordre des communes
            dans le menu, le pied de page et la section « Communes phares »,
            qui n&apos;en montre que les trois premières. Laissez vide à la
            création pour placer la commune en fin de liste ; en modification,
            un champ vidé conserve le rang actuel.
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-primary" />
          <span className="text-sm font-medium">Commune active</span>
        </label>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4 mt-6">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Présentation</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Utilisée par la section « Communes phares » de l&apos;accueil et par
            le menu du site.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idChamp}-accroche`}>Accroche</Label>
          <Input
            id={`${idChamp}-accroche`}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ex : Le prestige résidentiel"
          />
          <p className="text-xs text-neutral-500">
            Affichée sous le nom sur la carte de l&apos;accueil.
          </p>
        </div>

        <div className="space-y-1.5">
          {/* Chapeau de la zone Image : il coiffe l'uploader ET le champ URL,
              aucun des deux n'est « le » contrôle à étiqueter — d'où l'absence
              de `htmlFor`, que le champ URL compense par un `aria-label`. */}
          <Label>Image</Label>
          <ImageUploader
            value={imageUrls}
            onChange={setImageUrls}
            onUploadingChange={setPhotosEnEnvoi}
            pathPrefix={`communes/${item?.id ?? "nouveau"}`}
            maxFiles={1}
            disabled={submitting}
          />
          {photosEnEnvoi > 0 && (
            <p className="text-xs text-primary font-medium">
              Envoi en cours : l&apos;enregistrement est bloqué tant que
              l&apos;image n&apos;est pas montée.
            </p>
          )}
          <Input
            aria-label="Ou une URL d'image existante"
            value={imageAltUrl}
            onChange={(e) => setImageAltUrl(e.target.value)}
            placeholder="Ou une URL d'image existante"
            className="text-sm mt-2"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary"
          />
          <span className="text-sm">
            <span className="font-medium">Afficher sur l&apos;accueil</span>
            <span className="block text-xs text-neutral-500">
              La section « Communes phares » de l&apos;accueil montre les trois
              premières communes cochées, dans l&apos;ordre d&apos;affichage
              ci-dessus.
            </span>
          </span>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" asChild><Link href="/admin/geographie">Annuler</Link></Button>
        <Button type="submit" disabled={submitting || photosEnEnvoi > 0}>
          {submitting || photosEnEnvoi > 0 ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {photosEnEnvoi > 0 ? "Envoi de l'image…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
