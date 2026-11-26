import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { listBiensPourQr } from "@/src/actions/admin/avis";
import { getSiteContact } from "@/src/lib/site-contact";
import { CANAUX, construireLienSuivi } from "@/src/lib/liens-suivis";
import { BoutonImprimer } from "./bouton-imprimer";

export const metadata = { title: "Affiche du logement" };

/**
 * Affiche à imprimer pour un logement (vitrine, hall, panneau « À louer ») :
 * le QR code mène à la fiche du bien avec un lien suivi « affiche », pour
 * compter les visites et les demandes qu'elle apporte.
 */
export default async function AfficheBienPage(props: {
  params: Promise<{ bienId: string }>;
}) {
  const { bienId } = await props.params;
  const [biens, contact] = await Promise.all([listBiensPourQr(), getSiteContact()]);
  const bien = biens.find((b) => b.id === bienId);
  if (!bien) notFound();

  const canal = CANAUX.find((c) => c.cle === "affiche") ?? CANAUX[0];
  const lien = construireLienSuivi(`/properties/${bien.id}`, canal, bien.name ?? "bien");
  // SVG généré ici, à partir de notre propre lien : sûr à injecter.
  const svg = await QRCode.toString(lien, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1f1208", light: "#ffffff" },
  });

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link
          href="/admin/liens"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Liens suivis et QR codes
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Affiche : {bien.name ?? "Logement"}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <BoutonImprimer />
          <p className="break-all font-mono text-xs text-neutral-500">{lien}</p>
        </div>
      </div>

      <section className="mx-auto max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white text-center shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {bien.image && (
          <div className="relative h-64 w-full print:h-80">
            <Image src={bien.image} alt="" fill sizes="448px" className="object-cover" />
          </div>
        )}
        <div className="p-10">
          <Image
            src="/images/logo.png"
            alt="Agence Mirna"
            width={140}
            height={40}
            className="mx-auto h-auto w-28"
          />
          <h2 className="mt-6 font-agate text-4xl font-bold text-secondary leading-tight">
            {bien.name}
          </h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Photos, tarifs et réservation
          </p>
          <div
            className="mx-auto mt-6 w-56 [&_svg]:h-auto [&_svg]:w-full"
            role="img"
            aria-label="QR code vers la fiche du logement"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            Scannez ce code avec l&apos;appareil photo de votre téléphone.
          </p>
          <p className="mt-4 text-lg font-bold text-secondary">{contact.phone}</p>
          <p className="text-xs text-neutral-400">agencemirna.com</p>
        </div>
      </section>
    </div>
  );
}
