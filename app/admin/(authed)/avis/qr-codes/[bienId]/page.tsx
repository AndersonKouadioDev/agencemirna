import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { listBiensPourQr, obtenirLienAvis } from "@/src/actions/admin/avis";
import { ActionsAffiche } from "./actions-affiche";

export const metadata = { title: "Affiche QR code" };

/**
 * Affiche à imprimer pour un logement : le QR code mène au formulaire d'avis.
 * À l'impression, seule l'affiche sort (le reste de l'admin est masqué).
 */
export default async function AfficheQrPage(props: {
  params: Promise<{ bienId: string }>;
}) {
  const { bienId } = await props.params;
  const bien = (await listBiensPourQr()).find((b) => b.id === bienId);
  if (!bien) notFound();

  const lien = await obtenirLienAvis(bienId);
  if (!lien.ok) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Impossible de créer le lien : {lien.error}. La migration
        0029_avis_clients.sql est-elle appliquée dans Supabase ?
      </p>
    );
  }

  // SVG généré ici, à partir de notre propre lien : sûr à injecter.
  const svg = await QRCode.toString(lien.data, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1f1208", light: "#ffffff" },
  });

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link
          href="/admin/avis/qr-codes"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          QR codes des logements
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{bien.name ?? "Logement"}</h1>
        <ActionsAffiche bienId={bienId} lien={lien.data} />
      </div>

      {/* Affiche (format A5 portrait à l'impression) */}
      <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <Image
          src="/images/logo.png"
          alt="Agence Mirna"
          width={140}
          height={40}
          className="mx-auto h-auto w-32"
        />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Votre avis compte
        </p>
        <h2 className="mt-2 font-agate text-3xl font-bold text-secondary leading-tight">
          Comment se passe votre séjour ?
        </h2>
        <div
          className="mx-auto mt-8 w-64 [&_svg]:h-auto [&_svg]:w-full"
          aria-label="QR code vers le formulaire d'avis"
          role="img"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="mt-6 text-sm leading-relaxed text-neutral-600">
          Scannez ce code avec l&apos;appareil photo de votre téléphone et
          laissez-nous une note en une minute.
        </p>
        <p className="mt-6 text-xs text-neutral-400">
          {bien.name} · agencemirna.com
        </p>
      </section>
    </div>
  );
}
