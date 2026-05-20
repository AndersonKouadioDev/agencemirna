import { notFound } from "next/navigation";
import { getServiceAdmin } from "@/src/actions/admin/services";
import { ServiceForm } from "../service-form";

export const metadata = { title: "Édition service" };

export default async function AdminEditServicePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const service = await getServiceAdmin(id);

  if (!service) {
    notFound();
  }

  return <ServiceForm service={service} />;
}
