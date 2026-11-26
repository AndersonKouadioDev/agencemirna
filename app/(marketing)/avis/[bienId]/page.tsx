import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { createClient } from "@/src/supabase/server";
import { jetonAvisValide } from "@/src/actions/avis";
import { FormulaireAvis } from "@/components/avis/formulaire-avis";

/**
 * Page ouverte par le QR code affiché dans un logement :
 * /avis/<identifiant du bien>?j=<jeton>.
 *
 * Hors des moteurs de recherche : elle n'a de sens qu'avec le jeton du QR.
 */
export const metadata: Metadata = {
  title: "Votre avis sur votre séjour",
  robots: { index: false, follow: false },
};

async function lireBien(bienId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("biens")
    .select("id, name, image")
    .eq("id", bienId)
    .eq("is_active", true)
    .maybeSingle();
  return data as { id: string; name: string | null; image: string | null } | null;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ bienId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bienId } = await params;
  const sp = await searchParams;
  const jeton = typeof sp.j === "string" ? sp.j : "";

  const valide = await jetonAvisValide(bienId, jeton);
  const bien = valide ? await lireBien(bienId) : null;

  return (
    <main className="min-h-screen bg-[#FAF5EE] px-4 pt-36 pb-20 sm:pt-44">
      <div className="mx-auto max-w-xl">
        {valide && bien ? (
          <>
            <div className="mb-8 text-center">
              {bien.image && (
                <div className="relative mx-auto mb-5 h-24 w-24 overflow-hidden rounded-2xl shadow-sm">
                  <Image src={bien.image} alt="" fill sizes="96px" className="object-cover" />
                </div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Votre séjour chez Mirna
              </p>
              <h1 className="font-agate text-4xl sm:text-5xl font-bold text-secondary">
                Comment s&apos;est passé votre séjour
                {bien.name ? ` à ${bien.name}` : ""} ?
              </h1>
              <p className="mt-4 text-neutral-600">
                Votre avis aide les futurs voyageurs et nous aide à nous
                améliorer. Il ne prend qu&apos;une minute.
              </p>
            </div>
            <FormulaireAvis bienId={bien.id} jeton={jeton} />
          </>
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-stone-100">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-agate text-3xl font-bold text-secondary mb-3">
              Ce lien n&apos;est pas valable
            </h1>
            <p className="text-neutral-600 leading-relaxed">
              Pour laisser un avis, scannez le QR code affiché dans votre
              logement. Si le problème persiste, écrivez-nous : nous vous
              enverrons le bon lien.
            </p>
            <Link
              href="/contact_us"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90"
            >
              Nous contacter
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
