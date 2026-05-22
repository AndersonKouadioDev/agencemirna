"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  Youtube,
  Video as VideoIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../../_components/image-uploader";
import {
  upsertVideo,
  type VideoAdminRow,
} from "@/src/actions/admin/videos";
import { detectVideoProvider } from "@/lib/video-provider";

export function VideoForm({ video }: { video?: VideoAdminRow }) {
  const router = useRouter();
  const isEdit = !!video;

  const [title, setTitle] = React.useState(video?.title ?? "");
  const [description, setDescription] = React.useState(
    video?.description ?? "",
  );
  const [url, setUrl] = React.useState(video?.url ?? "");
  const [posterUrls, setPosterUrls] = React.useState<string[]>(
    video?.poster ? [video.poster] : [],
  );
  const [showOnHome, setShowOnHome] = React.useState(
    video?.show_on_home ?? true,
  );
  const [isActive, setIsActive] = React.useState(video?.is_active ?? true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Détection live du provider depuis l'URL → preview + feedback
  const providerInfo = React.useMemo(() => detectVideoProvider(url), [url]);

  const pathPrefix = React.useMemo(() => {
    if (video?.id) return `videos/${video.id}`;
    return `videos/draft-${typeof crypto !== "undefined" ? crypto.randomUUID().slice(0, 8) : Date.now()}`;
  }, [video?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertVideo({
      id: video?.id,
      title,
      description: description || null,
      url,
      poster: posterUrls[0] || null,
      show_on_home: showOnHome,
      is_active: isActive,
      ordre: video?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/videos?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 hover:bg-stone-100 text-neutral-600"
          >
            <Link href="/admin/videos" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Retour aux vidéos
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? title || "(sans titre)" : "Nouvelle vidéo"}
          </h1>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting ? "…" : isEdit ? "Enregistrer" : "Créer la vidéo"}
          </span>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Contenu">
            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex : Visite virtuelle Villa Cocody"
              />
            </Field>
            <Field label="Description courte">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Texte affiché sous la vidéo sur la home"
                rows={3}
              />
            </Field>
          </Section>

          <Section
            title="Source vidéo"
            subtitle="Colle un lien YouTube, Vimeo, ou l'URL directe d'un fichier .mp4/.webm. La preview ci-dessous valide automatiquement."
          >
            <Field label="URL de la vidéo" required>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://www.youtube.com/watch?v=… ou https://…mp4"
              />
            </Field>

            <ProviderPreview info={providerInfo} url={url} />
          </Section>

          <Section
            title="Image de couverture (poster)"
            subtitle="Affichée AVANT que l'utilisateur ne lance la vidéo. Facultative pour YouTube/Vimeo (leur miniature auto sera utilisée). Recommandée pour les fichiers .mp4."
          >
            <ImageUploader
              value={posterUrls}
              onChange={setPosterUrls}
              pathPrefix={pathPrefix}
              maxFiles={1}
            />
          </Section>
        </div>

        {/* Droite (1/3) */}
        <div className="space-y-6">
          <Section title="Publication">
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
                  {isActive ? "Vidéo active" : "Vidéo désactivée"}
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  {isActive
                    ? "Disponible sur le site (selon les conditions ci-dessous)"
                    : "Brouillon, jamais affichée sur le site"}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md p-2 -m-2 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-neutral-900">
                  Afficher sur la home
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  Une seule vidéo home à la fois : si plusieurs sont cochées,
                  c&apos;est l&apos;ordre le plus bas qui gagne.
                </span>
              </span>
            </label>
          </Section>

          <Section title="Comment ça marche ?">
            <div className="text-xs text-neutral-600 space-y-3 leading-relaxed">
              <div className="flex gap-2">
                <Youtube className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-900">YouTube</div>
                  Colle l&apos;URL complète. La vidéo s&apos;ouvre en iframe
                  embarquée, miniature auto.
                </div>
              </div>
              <div className="flex gap-2">
                <VideoIcon className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-900">Vimeo</div>
                  Idem YouTube. URL du type vimeo.com/123456.
                </div>
              </div>
              <div className="flex gap-2">
                <VideoIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-900">
                    Fichier direct (.mp4)
                  </div>
                  Si tu as hébergé un fichier sur Supabase Storage ou un CDN,
                  colle son URL publique. Recommande de définir un poster.
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/85 backdrop-blur border-t border-stone-200 px-6 lg:px-8 py-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          asChild
          className="hover:bg-stone-100 border-stone-200"
        >
          <Link href="/admin/videos">Annuler</Link>
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
                : "Créer la vidéo"}
          </span>
        </Button>
      </div>
    </form>
  );
}

// ─── Preview live de l'URL : feedback vert si reconnu, gris sinon ──────────
function ProviderPreview({
  info,
  url,
}: {
  info: ReturnType<typeof detectVideoProvider>;
  url: string;
}) {
  if (!url.trim()) return null;

  if (info.provider === "unknown") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          URL non reconnue automatiquement. Si c&apos;est un fichier .mp4
          ou .webm direct, la lecture fonctionnera quand même. Sinon vérifie
          le lien.
        </span>
      </div>
    );
  }

  const label =
    info.provider === "youtube"
      ? "YouTube"
      : info.provider === "vimeo"
        ? "Vimeo"
        : "Fichier vidéo direct";

  return (
    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
      <span>
        <strong>{label} détecté</strong>
        {info.id && ` · id : ${info.id}`}
      </span>
    </div>
  );
}

// ---------- Helpers ----------

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
