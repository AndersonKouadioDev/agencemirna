import { listInfosBandeau } from "@/src/actions/admin/bandeau";
import { getSiteContact } from "@/src/lib/site-contact";
import { BandeauClient } from "./bandeau-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Bandeau d'infos | Admin" };

export default async function BandeauPage() {
  const [infos, contact] = await Promise.all([
    listInfosBandeau(),
    getSiteContact(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-6 pb-24 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Bandeau d&apos;infos
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Les messages qui défilent en haut de chaque page du site. Glissez une
          ligne pour la déplacer : l&apos;ordre ici est celui du site.
        </p>
      </header>

      {/* Le numéro est transmis pour l'aperçu : il vient de /admin/parametres,
          et le jeton {telephone} doit s'y afficher résolu comme sur le site. */}
      <BandeauClient
        infos={infos}
        telephone={contact.phone}
        telHref={contact.telHref}
      />
    </div>
  );
}
