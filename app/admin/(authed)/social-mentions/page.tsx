import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listSocialMentionsAdmin } from "@/src/actions/admin/content";
import { MentionsList } from "./mentions-list";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Mentions sociales · Admin Mirna" };

export default async function AdminMentionsPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const items = await listSocialMentionsAdmin();
  const activeCount = items.filter((m) => m.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentions sociales</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Avis publics (Facebook, Google, Instagram, etc.) affichés dans
            la section "On parle de nous" de la home. {activeCount} active
            {activeCount > 1 ? "s" : ""} sur {items.length}.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/social-mentions/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvelle mention
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      {items.length === 0 ? <EmptyState /> : <MentionsList items={items} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <MessageCircle className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">
        Aucune mention pour l'instant
      </h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
        Ajoutez les avis que vous recevez sur vos réseaux sociaux pour
        renforcer la preuve sociale sur la page d'accueil.
      </p>
      <Button asChild>
        <Link href="/admin/social-mentions/nouveau">
          <Plus className="h-4 w-4 mr-1.5" /> Créer la première
        </Link>
      </Button>
    </div>
  );
}
