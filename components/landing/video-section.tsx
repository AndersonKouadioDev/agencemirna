import { getHomeVideo } from "@/src/actions/public";
import { detectVideoProvider } from "@/lib/video-provider";
import { VideoPlayer } from "./video-player";

/**
 * Section vidéo de la home.
 * Affiche la 1ère vidéo active marquée show_on_home=true depuis Supabase.
 * Si aucune → la section ne se rend pas (return null).
 *
 * Le composant VideoPlayer (client) gère la lecture lazy-loaded :
 *   1. Affichage initial : poster + bouton play (rien de chargé)
 *   2. Au clic sur play : injecte iframe (YouTube/Vimeo) ou <video> (mp4)
 * → 0 KB de player chargé tant que l'user ne clique pas, gain perf énorme.
 */
export default async function VideoSection() {
  const video = await getHomeVideo();
  if (!video) return null;

  const providerInfo = detectVideoProvider(video.url);
  // Si l'URL n'est ni YouTube/Vimeo/mp4, on n'affiche rien
  // (l'admin verra son URL invalide marquée en jaune dans le form).
  if (providerInfo.provider === "unknown") return null;

  return (
    <section className="bg-[#FAF5EE] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="max-w-3xl mb-10 text-center mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            En vidéo
          </p>
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
            {video.title}
          </h2>
          {video.description && (
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>

        <VideoPlayer
          url={video.url}
          title={video.title}
          poster={video.poster ?? providerInfo.thumbnailUrl ?? null}
          provider={providerInfo.provider}
          embedUrl={providerInfo.embedUrl}
        />
      </div>
    </section>
  );
}
