import Link from "next/link";
import { Plus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listFaqsAdmin } from "@/src/actions/admin/content";
import { FaqsList } from "./faqs-list";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "FAQ · Admin Mirna" };

export default async function AdminFaqsPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const items = await listFaqsAdmin();
  const activeCount = items.filter((f) => f.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FAQ</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Les questions fréquentes affichées sur la page À propos.{" "}
            {activeCount} active{activeCount > 1 ? "s" : ""} sur {items.length}.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/faqs/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvelle question
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {items.length === 0 ? <EmptyState /> : <FaqsList items={items} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <HelpCircle className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">
        Aucune question pour l'instant
      </h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
        Ajoutez les questions que vos clients vous posent souvent pour les
        afficher en accordion sur la page À propos.
      </p>
      <Button asChild>
        <Link href="/admin/faqs/nouveau">
          <Plus className="h-4 w-4 mr-1.5" /> Créer la première
        </Link>
      </Button>
    </div>
  );
}
