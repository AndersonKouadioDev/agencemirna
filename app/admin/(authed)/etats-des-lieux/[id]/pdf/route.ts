import { NextResponse } from "next/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { getEdl } from "@/src/actions/admin/etats-des-lieux";
import { genererPdfEdl, nomFichierEdl } from "@/src/lib/pdf-etat-des-lieux";

// Génération avec photos : laisser le temps de tout télécharger et assembler.
export const maxDuration = 60;

/** Téléchargement du PDF d'un état des lieux : /admin/etats-des-lieux/<id>/pdf */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await params;
  const edl = await getEdl(id);
  if (!edl) {
    return NextResponse.json({ error: "État des lieux introuvable." }, { status: 404 });
  }
  const entree = edl.entree_id ? await getEdl(edl.entree_id) : null;
  const pdf = await genererPdfEdl(edl, entree);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nomFichierEdl(edl)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
