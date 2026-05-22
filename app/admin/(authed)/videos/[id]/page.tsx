import { notFound } from "next/navigation";
import { getVideoAdmin } from "@/src/actions/admin/videos";
import { VideoForm } from "../video-form";

export const metadata = { title: "Modifier la vidéo" };

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoAdmin(id);
  if (!video) notFound();

  return <VideoForm video={video} />;
}
