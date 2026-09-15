import { notFound } from "next/navigation";
import {
  getArticleAdmin,
  listArticleSections,
} from "@/src/actions/admin/content";
import { ArticleForm } from "../article-form";

export const metadata = { title: "Édition article · Admin Mirna" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Les deux lectures sont indépendantes : les enchaîner ajouterait un
  // aller-retour à l'ouverture de chaque article.
  const [row, sections] = await Promise.all([
    getArticleAdmin(id),
    listArticleSections(id),
  ]);
  if (!row) notFound();
  return <ArticleForm row={row} sections={sections} />;
}
