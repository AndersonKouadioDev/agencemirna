import { listBiensPourQr } from "@/src/actions/admin/avis";
import { LISTE_PAGES_SEO } from "@/src/data/pages-seo";
import { GenerateurLiens } from "./generateur-liens";

export const metadata = { title: "Liens suivis et QR codes" };

export default async function LiensPage() {
  const biens = await listBiensPourQr();

  const destinations = [
    { chemin: "/", libelle: "Page d'accueil", bienId: null },
    { chemin: "/properties", libelle: "Tous les biens", bienId: null },
    ...LISTE_PAGES_SEO.map((p) => ({ chemin: `/${p.slug}`, libelle: p.lienCourt, bienId: null })),
    { chemin: "/estimation", libelle: "Estimation d'un bien", bienId: null },
    { chemin: "/contact_us", libelle: "Contact", bienId: null },
    ...biens.map((b) => ({
      chemin: `/properties/${b.id}`,
      libelle: `Bien : ${b.name ?? "sans nom"}`,
      bienId: b.id,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Liens suivis et QR codes</h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-3xl">
          Utilisez un lien différent par canal (fiche Google, WhatsApp, affiche…) :
          Google Analytics et la page Leads indiquent alors d&apos;où vient chaque
          visiteur et chaque demande. Sur un support imprimé, posez le QR code.
        </p>
      </div>
      <GenerateurLiens destinations={destinations} />
    </div>
  );
}
