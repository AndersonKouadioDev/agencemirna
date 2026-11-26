import Link from "next/link";
import { MessageSquareHeart, QrCode } from "lucide-react";
import { listAvisAdmin, type StatutAvis } from "@/src/actions/admin/avis";
import { cn } from "@/lib/utils";
import { ListeAvis } from "./liste-avis";

export const metadata = { title: "Avis clients" };

const FILTRES: { valeur: StatutAvis | "tous"; libelle: string }[] = [
  { valeur: "en_attente", libelle: "À relire" },
  { valeur: "publie", libelle: "Publiés" },
  { valeur: "refuse", libelle: "Refusés" },
  { valeur: "tous", libelle: "Tous" },
];

export default async function AdminAvisPage(props: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const sp = await props.searchParams;
  const statut =
    FILTRES.find((f) => f.valeur === sp.statut)?.valeur ?? "en_attente";

  const tous = await listAvisAdmin("tous");
  const avis = statut === "tous" ? tous : tous.filter((a) => a.statut === statut);
  const compte = (s: StatutAvis | "tous") =>
    s === "tous" ? tous.length : tous.filter((a) => a.statut === s).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Avis clients</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Avis laissés par les clients logés via le QR code du logement. Un
            avis n&apos;apparaît sur la fiche du bien qu&apos;une fois publié.
          </p>
        </div>
        <Link
          href="/admin/avis/qr-codes"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-stone-50"
        >
          <QrCode className="h-4 w-4" />
          QR codes des logements
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <Link
            key={f.valeur}
            href={`/admin/avis?statut=${f.valeur}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
              statut === f.valeur
                ? "border-primary bg-primary text-white"
                : "border-stone-200 bg-white text-neutral-700 hover:bg-stone-50",
            )}
          >
            {f.libelle}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                statut === f.valeur ? "bg-white/20" : "bg-stone-100",
              )}
            >
              {compte(f.valeur)}
            </span>
          </Link>
        ))}
      </div>

      {avis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Aucun avis ici</h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Imprimez le QR code de chaque logement et affichez-le à
            l&apos;intérieur : les clients pourront laisser leur avis depuis
            leur téléphone.
          </p>
        </div>
      ) : (
        <ListeAvis avis={avis} />
      )}
    </div>
  );
}
