/**
 * Détecte le provider d'une URL vidéo et extrait l'ID pour les iframes
 * d'embed. Supporte YouTube, Vimeo et les fichiers vidéo directs (.mp4,
 * .webm, .mov, .ogg).
 *
 * Utilisé côté admin (preview feedback dans le form) et côté public
 * (choix du rendu : iframe vs <video>).
 */

export type VideoProvider = "youtube" | "vimeo" | "file" | "unknown";

export type VideoProviderInfo = {
  provider: VideoProvider;
  /** ID externe (YouTube/Vimeo) ou null pour file/unknown */
  id: string | null;
  /** URL prête à l'emploi pour embed iframe ou <video src=…> */
  embedUrl: string | null;
  /** URL miniature auto (uniquement YouTube) */
  thumbnailUrl: string | null;
};

const FILE_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg", ".m4v"];

export function detectVideoProvider(rawUrl: string): VideoProviderInfo {
  const url = rawUrl?.trim() ?? "";
  if (!url) {
    return { provider: "unknown", id: null, embedUrl: null, thumbnailUrl: null };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { provider: "unknown", id: null, embedUrl: null, thumbnailUrl: null };
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  // ─── YouTube ─────────────────────────────────────────────────────────────
  // Formats acceptés :
  //   https://www.youtube.com/watch?v=VIDEO_ID
  //   https://youtu.be/VIDEO_ID
  //   https://www.youtube.com/embed/VIDEO_ID
  //   https://www.youtube.com/shorts/VIDEO_ID
  if (host === "youtube.com" || host === "m.youtube.com") {
    let id: string | null = null;
    if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      id = parsed.pathname.replace("/embed/", "").split("/")[0] ?? null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      id = parsed.pathname.replace("/shorts/", "").split("/")[0] ?? null;
    }
    if (id) {
      return {
        provider: "youtube",
        id,
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.replace(/^\//, "").split("/")[0] ?? null;
    if (id) {
      return {
        provider: "youtube",
        id,
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }

  // ─── Vimeo ───────────────────────────────────────────────────────────────
  // Formats acceptés : https://vimeo.com/123456 ou https://vimeo.com/channels/staffpicks/123456
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    // Extraire le dernier segment numérique du path
    const segments = parsed.pathname.split("/").filter(Boolean);
    const id = segments.reverse().find((s) => /^\d+$/.test(s)) ?? null;
    if (id) {
      return {
        provider: "vimeo",
        id,
        embedUrl: `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
        thumbnailUrl: null, // Vimeo nécessite un appel API séparé pour la miniature
      };
    }
  }

  // ─── Fichier vidéo direct (.mp4, .webm…) ────────────────────────────────
  const lowerPath = parsed.pathname.toLowerCase();
  if (FILE_EXTENSIONS.some((ext) => lowerPath.endsWith(ext))) {
    return {
      provider: "file",
      id: null,
      embedUrl: url, // L'URL elle-même est utilisable dans <video src=…>
      thumbnailUrl: null,
    };
  }

  return { provider: "unknown", id: null, embedUrl: null, thumbnailUrl: null };
}
