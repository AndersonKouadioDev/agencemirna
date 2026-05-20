import { notFound } from "next/navigation";
import { getAgentAdmin } from "@/src/actions/admin/agents";
import { AgentForm } from "../agent-form";

export const metadata = { title: "Édition agent" };

export default async function AdminEditAgentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const agent = await getAgentAdmin(id);
  if (!agent) notFound();
  return <AgentForm agent={agent} />;
}
