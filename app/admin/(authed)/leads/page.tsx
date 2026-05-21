import { Inbox } from "lucide-react";
import { listLeadsAdmin, type LeadSource, type LeadStatus } from "@/src/actions/admin/leads";
import { LeadsTable } from "./leads-table";
import { LeadsFilters } from "./leads-filters";

export const metadata = { title: "Leads · Admin Mirna" };

export default async function AdminLeadsPage(props: {
  searchParams: Promise<{ status?: string; source?: string }>;
}) {
  const sp = await props.searchParams;
  const status = (sp.status as LeadStatus | "all" | undefined) ?? "all";
  const source = (sp.source as LeadSource | "all" | undefined) ?? "all";

  const leads = await listLeadsAdmin({ status, source });

  // Counts par status pour les badges des filtres (fait sur le résultat sans filtre,
  // pour les pills "Tous", "Nouveaux", etc. on charge tout)
  const allLeads = await listLeadsAdmin();
  const byStatus = {
    all: allLeads.length,
    new: allLeads.filter((l) => l.status === "new").length,
    in_progress: allLeads.filter((l) => l.status === "in_progress").length,
    qualified: allLeads.filter((l) => l.status === "qualified").length,
    converted: allLeads.filter((l) => l.status === "converted").length,
    rejected: allLeads.filter((l) => l.status === "rejected").length,
    archived: allLeads.filter((l) => l.status === "archived").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Toutes les demandes entrantes du site (contact, estimation,
          demande de visite, newsletter). {allLeads.length} au total.
        </p>
      </div>

      <LeadsFilters
        currentStatus={status}
        currentSource={source}
        counts={byStatus}
      />

      {leads.length === 0 ? <EmptyState /> : <LeadsTable leads={leads} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Inbox className="h-5 w-5" />
      </div>
      <h2 className="font-agate text-xl text-secondary mb-1">
        Aucun lead pour ce filtre
      </h2>
      <p className="text-sm text-neutral-600 max-w-sm mx-auto">
        Les demandes entrantes du site apparaîtront ici dès qu'un visiteur
        soumet un formulaire (contact, estimation, demande de visite,
        inscription newsletter).
      </p>
    </div>
  );
}
