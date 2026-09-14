
import { getSiteSettings } from "@/src/actions/admin/settings";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Paramètres · Admin Mirna" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres du site</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gérez vos coordonnées et liens vers vos réseaux sociaux. Ces informations
          sont affichées publiquement sur le site (header, footer, page de contact).
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
