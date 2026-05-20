import { listServicesAdmin } from "@/src/actions/admin/services";
import { ServicesList } from "./services-list";
import { FlashBanner } from "./flash-banner";

export const metadata = { title: "Services" };

export default async function AdminServicesPage(props: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await props.searchParams;
  const services = await listServicesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Les {services.length} prestations métier de l'agence (page{" "}
          <code className="text-xs">/services</code> côté public).
          Réorganisez par drag-and-drop, activez/désactivez, et éditez chacun.
        </p>
      </div>

      {flash && <FlashBanner type={flash} />}

      <ServicesList services={services} />
    </div>
  );
}
