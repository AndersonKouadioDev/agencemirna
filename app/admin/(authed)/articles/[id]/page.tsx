import { notFound } from "next/navigation";
import { getArticleAdmin } from "@/src/actions/admin/content";
import { ArticleForm } from "../article-form";

export const metadata = { title: "Édition article · Admin Mirna" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getArticleAdmin(id);
  if (!row) notFound();
  return <ArticleForm row={row} />;
}
