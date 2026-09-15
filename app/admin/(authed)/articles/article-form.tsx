"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../../_components/image-uploader";
import {
  upsertArticle,
  type ArticleRow,
  type ArticleSectionRow,
} from "@/src/actions/admin/content";
import {
  EditeurSections,
  creerSectionVide,
  sectionsDepuisBase,
  type SectionBrouillon,
} from "./_components/editeur-sections";
import {
  MESSAGE_URL_IMAGE_INVALIDE,
  normaliserUrlImage,
} from "@/src/lib/image-url";

function toDateInput(iso?: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function ArticleForm({
  row,
  sections: sectionsEnBase,
}: {
  row?: ArticleRow;
  sections?: ArticleSectionRow[];
}) {
  const router = useRouter();
  const isEdit = !!row;

  const [title, setTitle] = React.useState(row?.title ?? "");
  const [slug, setSlug] = React.useState(row?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(row?.excerpt ?? "");
  // Le corps de l'article vit désormais dans `article_sections`. Un article
  // repris par la migration 0023 arrive avec sa première section déjà
  // remplie ; un article neuf part d'une section vide, pour que le rédacteur
  // ait immédiatement où écrire.
  const [sections, setSections] = React.useState<SectionBrouillon[]>(() => {
    const reprises = sectionsDepuisBase(sectionsEnBase ?? []);
    return reprises.length > 0 ? reprises : [creerSectionVide()];
  });
  const [category, setCategory] = React.useState(row?.category ?? "");
  const [readTime, setReadTime] = React.useState<string>(
    row?.read_time_minutes?.toString() ?? "5",
  );
  const [publishedAt, setPublishedAt] = React.useState(
    toDateInput(row?.published_at),
  );
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);
  // Rang de tri : dominant sur le blog et la page À propos, il n'était
  // exposé nulle part alors que la création l'auto-incrémentait.
  const [ordre, setOrdre] = React.useState(row?.ordre?.toString() ?? "");

  const [imageUrls, setImageUrls] = React.useState<string[]>(
    row?.image && row.image.startsWith("/images/") ? [] : row?.image ? [row.image] : [],
  );
  const [imageAlt, setImageAlt] = React.useState(
    row?.image && row.image.startsWith("/images/") ? row.image : "",
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Nombre de photos en cours d'envoi, remonté par <ImageUploader>. Le
  // composant n'appelle `onChange` qu'une fois le lot complet monté :
  // enregistrer pendant ce temps soumettait la liste INCHANGÉE, donc aucune
  // des photos déposées, et laissait les fichiers déjà montés orphelins.
  const [photosEnEnvoi, setPhotosEnEnvoi] = React.useState(0);
  // Même garde pour les images de sections, remontée en un seul total par
  // <EditeurSections> : elles passent par le même téléverseur, donc par le
  // même piège.
  const [imagesSectionsEnEnvoi, setImagesSectionsEnEnvoi] = React.useState(0);
  const envoisEnCours = photosEnEnvoi + imagesSectionsEnEnvoi;

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
  const pathPrefix = row?.id ? `articles/${row.id}` : `articles/draft-${brouillonId}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // La touche Entrée soumet le formulaire même bouton désactivé : la garde
    // doit vivre ici aussi, sinon l'image en vol serait perdue — et le
    // formulaire refuserait l'enregistrement, faute d'image.
    if (envoisEnCours > 0) {
      setError(
        "Une image est encore en cours d'envoi. Patientez la fin de l'envoi avant d'enregistrer.",
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

    const ordreSaisi = Number.parseInt(ordre, 10);

    // Une section restée vide n'a rien à publier : on l'écarte sans rien dire
    // plutôt que de refuser l'enregistrement pour une ligne ajoutée par
    // mégarde. L'ordre du tableau restant fait foi côté action.
    const sectionsAEnvoyer = sections
      .filter(
        (s) =>
          s.titre.trim() !== "" ||
          s.contenu_md.trim() !== "" ||
          s.images.length > 0,
      )
      .map((s) => ({
        id: s.id,
        titre: s.titre.trim() || null,
        contenu_md: s.contenu_md.trim() || null,
        images: s.images,
        position_image: s.position_image,
      }));

    const result = await upsertArticle({
      id: row?.id,
      slug,
      title,
      excerpt: excerpt || null,
      // Le corps n'est plus saisi ici, mais `upsertArticle` réécrit la colonne
      // à chaque enregistrement : la renvoyer inchangée préserve la copie de
      // secours que la migration 0023 a laissée derrière elle. L'omettre la
      // viderait dès la première sauvegarde.
      content_md: row?.content_md ?? null,
      image: finalImage,
      category: category || null,
      read_time_minutes: readTime ? parseInt(readTime, 10) : null,
      published_at: publishedAt
        ? new Date(publishedAt).toISOString()
        : null,
      is_active: isActive,
      ordre: Number.isNaN(ordreSaisi) ? undefined : ordreSaisi,
      sections: sectionsAEnvoyer,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/articles?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>
        <Button type="submit" disabled={submitting || envoisEnCours > 0}>
          {submitting || envoisEnCours > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {envoisEnCours > 0
            ? "Envoi des images…"
            : isEdit
              ? "Enregistrer"
              : "Publier l'article"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? row?.title : "Nouvel article"}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Contenu</h2>

            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Top 5 quartiers où investir à Abidjan en 2026"
                required
              />
            </Field>

            <Field label="Slug (URL)">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-généré depuis le titre si vide"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Utilisé pour l&apos;URL publique /actualites/[slug]. Laissez
                vide pour génération automatique.
              </p>
            </Field>

            <Field label="Extrait (chapô)">
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé court affiché sur la card du blog (3 lignes)."
                rows={3}
              />
            </Field>

          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Image de couverture</h2>
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
                placeholder="Ex : /images/biens/bien15.jpg"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-secondary">Méta</h2>

            <Field label="Catégorie">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex : Guide propriétaire"
              />
            </Field>

            <Field label="Temps de lecture (minutes)">
              <Input
                type="number"
                min={1}
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
              />
            </Field>

            <Field label="Date de publication">
              <Input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </Field>

            <Field label="Ordre d'affichage">
              <Input
                type="number"
                value={ordre}
                onChange={(e) => setOrdre(e.target.value)}
                placeholder="0"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Les plus petits nombres passent en premier sur le blog et la
                page À propos ; à rang égal, l&apos;article le plus récent sort
                devant. Saisissez 0 pour vous en remettre à la date seule.
                Laissé vide, le rang en place est conservé — un nouvel article
                démarre à 0, donc en tête.
              </p>
            </Field>
          </section>

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
                  Article publié
                </span>
                <span className="block text-xs text-neutral-500">
                  Visible dans le blog public si coché.
                </span>
              </span>
            </label>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold text-secondary">
            Corps de l&apos;article
          </h2>
          <p className="text-xs text-neutral-500">
            {sections.length} section{sections.length > 1 ? "s" : ""} —
            affichées dans cet ordre sur la page publique.
          </p>
        </div>
        <EditeurSections
          sections={sections}
          onChange={setSections}
          pathPrefix={`${pathPrefix}/sections`}
          titreArticle={title}
          disabled={submitting}
          onEnvoiChange={setImagesSectionsEnEnvoi}
        />
      </section>
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
