import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listVideosAdmin } from "@/src/actions/admin/videos";
import { VideosTable } from "./videos-table";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Vidéos" };

export default async function AdminVideosPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const videos = await listVideosAdmin();

  const activeHomeCount = videos.filter(
    (v) => v.is_active && v.show_on_home,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vidéos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Une vidéo peut être affichée sur la home (YouTube, Vimeo, ou
            fichier direct). Total : {videos.length} vidéo
            {videos.length > 1 ? "s" : ""}
            {activeHomeCount > 0 && (
              <>
                {" · "}
                <span className="text-primary font-semibold">
                  {activeHomeCount} sur la home
                </span>
              </>
            )}
            .
          </p>
        </div>
        <Button asChild>
          <Link
            href="/admin/videos/nouveau"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nouvelle vidéo
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      <VideosTable videos={videos} />
    </div>
  );
}
