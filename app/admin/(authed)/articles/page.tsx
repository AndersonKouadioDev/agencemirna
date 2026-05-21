import Link from "next/link";
import { Plus, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listArticlesAdmin } from "@/src/actions/admin/content";
import { ArticlesList } from "./articles-list";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Articles · Admin Mirna" };

export default async function AdminArticlesPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const items = await listArticlesAdmin();
  const activeCount = items.filter((a) => a.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Le blog "Le marché immobilier décodé" sur la page À propos.{" "}
            {activeCount} actif{activeCount > 1 ? "s" : ""} sur {items.length}.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {items.length === 0 ? <EmptyState /> : <ArticlesList items={items} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Newspaper className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">
        Aucun article publié
      </h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
        Publiez vos premiers conseils, guides et analyses du marché
        immobilier abidjanais.
      </p>
      <Button asChild>
        <Link href="/admin/articles/nouveau">
          <Plus className="h-4 w-4 mr-1.5" /> Créer le premier
        </Link>
      </Button>
    </div>
  );
}
