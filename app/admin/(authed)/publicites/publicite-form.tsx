"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Loader2, Megaphone, PlayCircle, Save, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import { LecteurVideo } from "@/components/video/lecteur-video";
import { MESSAGE_URL_IMAGE_INVALIDE, normaliserUrlImage } from "@/src/lib/image-url";
import { MESSAGE_URL_VIDEO_INVALIDE, videoLisible } from "@/src/lib/video";
import { EMPLACEMENTS_PUB, type TypePub } from "@/src/lib/publicites";
import {
  type BienPourPub,
  type PubliciteAdminRow,
  type PubliciteFormData,
  upsertPubliciteAndRedirect,
} from "@/src/actions/admin/publicites";

const TYPES: Array<{ valeur: TypePub; titre: string; aide: string; Icone: typeof ImageIcon }> = [
  { valeur: "image", titre: "Image", aide: "Un visuel, avec accroche et bouton en surimpression.", Icone: ImageIcon },
  { valeur: "texte", titre: "Texte", aide: "Un message fort sur fond de couleur, sans visuel.", Icone: Type },
  { valeur: "video", titre: "Vidéo", aide: "YouTube, Vimeo ou fichier .mp4, lue sur place.", Icone: PlayCircle },
];

export function PubliciteForm({ pub, biens = [] }: { pub?: PubliciteAdminRow; biens?: BienPourPub[] }) {
  const isEdit = !!pub;

  const [titre, setTitre] = useState(pub?.titre ?? "");
  const [type, setType] = useState<TypePub>(pub?.type ?? "image");
  const [emplacement, setEmplacement] = useState(pub?.emplacement ?? EMPLACEMENTS_PUB[0].cle);
  const [accroche, setAccroche] = useState(pub?.accroche ?? "");
  const [corps, setCorps] = useState(pub?.corps ?? "");
  const [lien, setLien] = useState(pub?.lien ?? "");
  const [ctaLabel, setCtaLabel] = useState(pub?.cta_label ?? "");
  const [videoUrl, setVideoUrl] = useState(pub?.video_url ?? "");
  const [bienId, setBienId] = useState(pub?.bien_id ?? "");
  const [bienQuery, setBienQuery] = useState("");
  const [isActive, setIsActive] = useState(pub?.is_active ?? true);
  const [startsAt, setStartsAt] = useState(pub?.starts_at ? versLocal(pub.starts_at) : "");
  const [endsAt, setEndsAt] = useState(pub?.ends_at ? versLocal(pub.ends_at) : "");

  // Même garde que les annonces : une image héritée hors des hôtes de
  // next.config ferait tomber la page d'édition elle-même si l'uploader la
  // rendait. Elle revient dans le champ texte, où elle sera refusée.
  const imageInitiale = pub?.image ?? null;
  const imageRendable = imageInitiale && normaliserUrlImage(imageInitiale) !== undefined ? imageInitiale : null;
  const [imageUrls, setImageUrls] = useState<string[]>(imageRendable ? [imageRendable] : []);
  const [imageAltUrl, setImageAltUrl] = useState(imageInitiale && !imageRendable ? imageInitiale : "");
  const [photosEnEnvoi, setPhotosEnEnvoi] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idUrlImage = React.useId();
  const idVideo = React.useId();

  const biensFiltres = React.useMemo(() => {
    const q = bienQuery.trim().toLowerCase();
    const liste = q ? biens.filter((b) => [b.name, b.ville_commune].filter(Boolean).join(" ").toLowerCase().includes(q)) : biens;
    return liste.slice(0, 40);
  }, [biens, bienQuery]);
  const bienChoisi = biens.find((b) => b.id === bienId) ?? null;

  function refuser(message: string) {
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (photosEnEnvoi > 0) return refuser("Le visuel est encore en cours d'envoi. Patientez avant d'enregistrer.");

    const urlManuelle = imageUrls[0] ? null : normaliserUrlImage(imageAltUrl);
    if (urlManuelle === undefined) return refuser(MESSAGE_URL_IMAGE_INVALIDE);
    const image = imageUrls[0] || urlManuelle || null;

    if (type === "image" && !image) return refuser("Une publicité « image » a besoin d'une image.");
    if (type === "video") {
      if (!videoUrl.trim()) return refuser("Une publicité « vidéo » a besoin de l'adresse de sa vidéo.");
      if (!videoLisible(videoUrl)) return refuser(MESSAGE_URL_VIDEO_INVALIDE);
    }
    if (type === "texte" && !corps.trim()) return refuser("Une publicité « texte » a besoin d'un texte.");

    setSubmitting(true);
    const data: PubliciteFormData = {
      id: pub?.id,
      titre: titre.trim(),
      type,
      emplacement,
      image,
      video_url: videoUrl.trim() || null,
      accroche: accroche.trim() || null,
      corps: corps.trim() || null,
      lien: lien.trim() || null,
      cta_label: ctaLabel.trim() || null,
      bien_id: bienId || null,
      is_active: isActive,
      starts_at: depuisLocal(startsAt),
      ends_at: depuisLocal(endsAt),
    };
    const r = await upsertPubliciteAndRedirect(data);
    if (!r.ok) {
      setSubmitting(false);
      refuser(r.error);
    }
  }

  const pages = Array.from(new Set(EMPLACEMENTS_PUB.map((e) => e.page)));

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl pt-6 pb-24 px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0 text-neutral-500 hover:text-neutral-900">
          <Link href="/admin/publicites"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-neutral-900">
            <Megaphone className="h-5 w-5 text-neutral-400" />
            {isEdit ? "Modifier la publicité" : "Nouvelle publicité"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Elle s&apos;affiche sur l&apos;emplacement choisi dès qu&apos;elle est active.</p>
        </div>
      </div>

      {error && <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Où et quoi">
            <Field label="Nom interne" required>
              <Input value={titre} onChange={(e) => setTitre(e.target.value)} required placeholder="Ex : Villa Riviera — campagne septembre" />
            </Field>
            <Field label="Emplacement" required>
              <select value={emplacement} onChange={(e) => setEmplacement(e.target.value)} className="flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                {pages.map((page) => (
                  <optgroup key={page} label={page}>
                    {EMPLACEMENTS_PUB.filter((e) => e.page === page).map((e) => (
                      <option key={e.cle} value={e.cle}>{e.libelle} · {e.format}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-1 text-xs text-stone-500">Le format (bandeau, encart, colonne) est celui de la place : la même pub s&apos;y adapte.</p>
            </Field>
            <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <legend className="mb-2 text-xs font-medium text-neutral-700">Type</legend>
              {TYPES.map(({ valeur, titre: t, aide, Icone }) => (
                <label key={valeur} className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${type === valeur ? "border-primary bg-primary/5" : "border-stone-200 hover:bg-stone-50"}`}>
                  <input type="radio" name="type" value={valeur} checked={type === valeur} onChange={() => setType(valeur)} className="mt-0.5 h-4 w-4 border-stone-300 text-primary" />
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900"><Icone className="h-3.5 w-3.5" />{t}</span>
                    <span className="mt-0.5 block text-xs text-neutral-500">{aide}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </Section>

          <Section title="Contenu">
            {type === "video" && (
              <Field label="Adresse de la vidéo" required>
                <Input id={idVideo} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
                {videoUrl.trim() && (videoLisible(videoUrl) ? (
                  <div className="mt-3"><LecteurVideo url={videoUrl.trim()} affiche={imageUrls[0] ?? imageAltUrl} titre={accroche || titre || "Aperçu"} className="max-w-sm" /></div>
                ) : (
                  <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{MESSAGE_URL_VIDEO_INVALIDE}</p>
                ))}
              </Field>
            )}
            <Field label="Accroche">
              <Input value={accroche} onChange={(e) => setAccroche(e.target.value)} maxLength={80} placeholder="Ex : Exclusivité · Cocody" />
              <p className="mt-1 text-xs text-stone-500">Surtitre court, en capitales sur la pub.</p>
            </Field>
            <Field label={type === "texte" ? "Texte" : "Message"} required={type === "texte"}>
              <Textarea value={corps} onChange={(e) => setCorps(e.target.value)} rows={3} maxLength={220} placeholder={type === "texte" ? "Le message, en une ou deux phrases fortes." : "Facultatif : une ligne en surimpression du visuel."} />
              <p className="mt-1 text-xs text-stone-500">{corps.length}/220</p>
            </Field>
            {type !== "texte" && (
              <div>
                <p className="mb-2 text-xs font-medium text-neutral-700">{type === "video" ? "Affiche avant lecture (facultative)" : "Image"}{type === "image" && <span className="ml-0.5 text-red-500">*</span>}</p>
                <ImageUploader value={imageUrls} onChange={setImageUrls} onUploadingChange={setPhotosEnEnvoi} pathPrefix="publicites" maxFiles={1} disabled={submitting} />
                <div className="mt-4 border-t border-stone-200 pt-4">
                  <Label htmlFor={idUrlImage} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Ou une image existante (URL)</Label>
                  <Input id={idUrlImage} value={imageAltUrl} onChange={(e) => setImageAltUrl(e.target.value)} placeholder="/images/… ou https://…" className="text-sm" />
                </div>
              </div>
            )}
          </Section>

          <Section title="Destination" subtitle="Par défaut, la pub mène à la fiche du bien choisi.">
            <Field label="Rechercher un bien">
              <Input value={bienQuery} onChange={(e) => setBienQuery(e.target.value)} placeholder="Nom ou commune…" />
            </Field>
            <Field label="Bien promu (facultatif)">
              <select value={bienId} onChange={(e) => setBienId(e.target.value)} className="flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                <option value="">— Aucun —</option>
                {biensFiltres.map((b) => (
                  <option key={b.id} value={b.id}>{b.name ?? "Sans nom"}{b.ville_commune ? ` · ${b.ville_commune}` : ""}{b.is_active ? "" : " (dépublié)"}</option>
                ))}
              </select>
              {bienChoisi && !bienChoisi.is_active && <p className="mt-1 text-xs text-amber-700">Ce bien est dépublié : la pub restera sans destination.</p>}
            </Field>
            <Field label="Lien personnalisé (facultatif)">
              <Input value={lien} onChange={(e) => setLien(e.target.value)} placeholder="Prime sur le bien : /services, https://…" />
            </Field>
            <Field label="Libellé du bouton (facultatif)">
              <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Voir le bien" />
            </Field>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Publication">
            <label className="-m-2 flex cursor-pointer select-none items-start gap-3 rounded-md p-2 hover:bg-stone-50">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30" />
              <span className="flex-1">
                <span className={`block text-sm font-medium ${isActive ? "text-neutral-900" : "text-neutral-500"}`}>{isActive ? "Publicité active" : "Publicité désactivée"}</span>
                <span className="mt-0.5 block text-xs text-neutral-500">{isActive ? "Visible sur son emplacement, dans sa plage de dates" : "Brouillon, masquée du site"}</span>
              </span>
            </label>
          </Section>
          <Section title="Période d'affichage" subtitle="Vide = permanente.">
            <Field label="Début"><Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></Field>
            <Field label="Fin"><Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></Field>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-6 flex justify-end gap-2 border-t border-stone-200 bg-white/85 px-6 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <Button type="button" variant="outline" asChild className="border-stone-200 hover:bg-stone-100"><Link href="/admin/publicites">Annuler</Link></Button>
        <Button type="submit" disabled={submitting || photosEnEnvoi > 0} className="bg-primary text-secondary hover:bg-[#D4981C]">
          {submitting || photosEnEnvoi > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-1.5">{photosEnEnvoi > 0 ? "Envoi du visuel…" : submitting ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la publicité"}</span>
        </Button>
      </div>
    </form>
  );
}

function depuisLocal(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function versLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
      <header>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  const id = React.useId();
  const enfants = React.Children.toArray(children);
  const i = enfants.findIndex((e) => React.isValidElement(e));
  const controles = enfants.map((e, k) => (k === i ? React.cloneElement(e as React.ReactElement<{ id?: string }>, { id }) : e));
  return (
    <div className="space-y-1.5">
      <Label htmlFor={i >= 0 ? id : undefined} className="text-xs font-medium text-neutral-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</Label>
      <div>{controles}</div>
    </div>
  );
}
