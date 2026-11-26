import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { listBiensPourQr } from "@/src/actions/admin/avis";

export const metadata = { title: "QR codes des avis" };

export default async function QrCodesPage() {
  const biens = await listBiensPourQr();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/avis"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Avis clients
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">QR codes des logements</h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
          Ouvrez l&apos;affiche d&apos;un logement, imprimez-la et posez-la à
          l&apos;intérieur (entrée, salon). Le client scanne le code avec
          l&apos;appareil photo de son téléphone pour laisser son avis.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {biens.map((bien) => (
          <li key={bien.id}>
            <Link
              href={`/admin/avis/qr-codes/${bien.id}`}
              className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 hover:border-primary hover:shadow-sm transition"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {bien.image && (
                  <Image src={bien.image} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <span className="flex-1 font-medium text-secondary line-clamp-2">
                {bien.name ?? "Sans nom"}
              </span>
              <QrCode className="h-5 w-5 shrink-0 text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
