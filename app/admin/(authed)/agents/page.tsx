import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAgentsAdmin } from "@/src/actions/admin/agents";
import { AgentsGrid } from "./agents-grid";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Agents" };

export default async function AdminAgentsPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const agents = await listAgentsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-neutral-500 mt-1">
            L'équipe d'Agence Mirna — {agents.length} agent
            {agents.length > 1 ? "s" : ""}. Glissez-déposez pour réorganiser.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/agents/nouveau" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvel agent
          </Link>
        </Button>
      </div>

      {flash && <FlashBanner type={flash} />}

      <AgentsGrid agents={agents} />
    </div>
  );
}
