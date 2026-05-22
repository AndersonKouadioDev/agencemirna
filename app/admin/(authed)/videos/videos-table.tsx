"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Home as HomeIcon,
  Youtube,
  Video as VideoIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type VideoAdminRow,
  deleteVideo,
  toggleVideoActive,
  toggleVideoOnHome,
} from "@/src/actions/admin/videos";
import { detectVideoProvider } from "@/lib/video-provider";

export function VideosTable({ videos }: { videos: VideoAdminRow[] }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
        <VideoIcon className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm text-neutral-600 mb-4">
          Aucune vidéo enregistrée. Crée la première pour qu&apos;elle
          apparaisse sur la home.
        </p>
        <Button asChild>
          <Link href="/admin/videos/nouveau">Créer une vidéo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: VideoAdminRow }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<null | "active" | "home" | "delete">(
    null,
  );

  const info = React.useMemo(() => detectVideoProvider(video.url), [video.url]);
  const thumbnail =
    video.poster ||
    info.thumbnailUrl ||
    null;

  const providerLabel =
    info.provider === "youtube"
      ? "YouTube"
      : info.provider === "vimeo"
        ? "Vimeo"
        : info.provider === "file"
          ? "Fichier"
          : "URL";

  const ProviderIcon =
    info.provider === "youtube"
      ? Youtube
      : info.provider === "file"
        ? VideoIcon
        : ExternalLink;

  async function onToggleActive() {
    setBusy("active");
    await toggleVideoActive(video.id, !video.is_active);
    router.refresh();
    setBusy(null);
  }
  async function onToggleHome() {
    setBusy("home");
    await toggleVideoOnHome(video.id, !video.show_on_home);
    router.refresh();
    setBusy(null);
  }
  async function onDelete() {
    if (
      !window.confirm(
        `Supprimer la vidéo "${video.title}" ? Cette action est irréversible.`,
      )
    )
      return;
    setBusy("delete");
    await deleteVideo(video.id);
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden hover:border-stone-300 transition-colors">
      {/* Thumbnail */}
      <Link
        href={`/admin/videos/${video.id}`}
        className="relative block aspect-video bg-stone-100 overflow-hidden group"
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={thumbnail.startsWith("http")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoIcon className="h-12 w-12 text-neutral-300" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="h-5 w-5 text-secondary translate-x-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Provider badge */}
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-neutral-700 shadow-sm">
          <ProviderIcon className="h-3 w-3" />
          {providerLabel}
        </div>
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {!video.is_active && (
            <span className="inline-flex items-center rounded-md bg-neutral-900/85 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-white">
              Désactivée
            </span>
          )}
          {video.is_active && video.show_on_home && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-white">
              <HomeIcon className="h-3 w-3" />
              Home
            </span>
          )}
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-neutral-900 line-clamp-1">
            {video.title}
          </h3>
          {video.description && (
            <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>

        {/* URL preview */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs text-neutral-400 hover:text-primary transition-colors"
          title={video.url}
        >
          {video.url}
        </a>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-2 border-t border-stone-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleActive}
            disabled={busy !== null}
            className="flex-1 text-xs"
            title={video.is_active ? "Désactiver" : "Activer"}
          >
            {busy === "active" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : video.is_active ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleHome}
            disabled={busy !== null}
            className="flex-1 text-xs"
            title={video.show_on_home ? "Retirer de la home" : "Afficher sur la home"}
          >
            {busy === "home" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <HomeIcon
                className={`h-3.5 w-3.5 ${video.show_on_home ? "text-primary" : ""}`}
              />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="flex-1"
          >
            <Link href={`/admin/videos/${video.id}`}>
              <Edit className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={busy !== null}
            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Supprimer"
          >
            {busy === "delete" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
