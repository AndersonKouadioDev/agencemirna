import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEdl, liensFichiersEdl } from "@/src/actions/admin/etats-des-lieux";
import { cheminsFichiers, dateLongue, libelleType } from "@/src/lib/etat-des-lieux";
import { SaisieEdl } from "@/components/etat-des-lieux/saisie-edl";
import { VueEdl } from "@/components/etat-des-lieux/vue-edl";
import { ActionsEdl } from "./actions-edl";

export const metadata = { title: "État des lieux" };

export default async function EdlPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const edl = await getEdl(id);
  if (!edl) notFound();
  const entree = edl.entree_id ? await getEdl(edl.entree_id) : null;
  const liens = await liensFichiersEdl([
    ...cheminsFichiers(edl),
    ...(entree ? cheminsFichiers(entree) : []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/etats-des-lieux"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          États des lieux
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {libelleType(edl.type)} · {edl.bien?.name ?? "Logement"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {edl.statut === "signe"
            ? `Signé le ${dateLongue(edl.signe_le ?? edl.updated_at)}${edl.envoye_le ? ` · envoyé par e-mail le ${dateLongue(edl.envoye_le)}` : ""}`
            : "En cours de saisie : tout est enregistré automatiquement."}
        </p>
      </div>

      {edl.statut === "signe" ? (
        <>
          <ActionsEdl edl={edl} />
          <VueEdl edl={edl} entree={entree} liens={liens} />
        </>
      ) : (
        <SaisieEdl edl={edl} entree={entree} liens={liens} />
      )}
    </div>
  );
}
