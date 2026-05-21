import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Calculator,
  ExternalLink,
  Home,
  Mail,
  Megaphone,
  Phone,
  Trash2,
} from "lucide-react";
import { getLeadAdmin } from "@/src/actions/admin/leads";
import { LeadActions } from "./lead-actions";
import { LeadNotes } from "./lead-notes";
import { LeadDelete } from "./lead-delete";

export const metadata = { title: "Lead · Admin Mirna" };

const SOURCE_LABELS: Record<string, string> = {
  contact: "Formulaire de contact",
  estimation: "Demande d'estimation",
  visit_request: "Demande de visite",
  newsletter: "Inscription newsletter",
  other: "Autre",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadAdmin(id);
  if (!lead) notFound();

  const sourceLabel = SOURCE_LABELS[lead.source] ?? lead.source;
  const metadata = lead.metadata as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux leads
        </Link>
        <LeadDelete id={lead.id} />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
          {sourceLabel}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {lead.full_name || (
            <span className="text-neutral-400 italic">Demandeur anonyme</span>
          )}
        </h1>
        <p className="text-sm text-neutral-500 mt-1 inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Reçu le {formatDateTime(lead.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coordonnées */}
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Coordonnées
            </h2>
            <div className="space-y-2">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors group"
                >
                  <Mail className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
                  {lead.email}
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors group"
                >
                  <Phone className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
                  {lead.phone}
                </a>
              )}
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 transition-colors mt-2"
                >
                  Discuter sur WhatsApp
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {!lead.email && !lead.phone && (
                <p className="text-sm text-neutral-400 italic">
                  Aucune coordonnée renseignée.
                </p>
              )}
            </div>
          </section>

          {/* Message */}
          {lead.message && (
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Message
              </h2>
              <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {lead.message}
              </p>
            </section>
          )}

          {/* Métadonnées (pour estimation, visit_request, etc.) */}
          {metadata && Object.keys(metadata).length > 0 && (
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Détails additionnels
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs uppercase tracking-wider text-neutral-500">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="font-medium text-neutral-800 mt-0.5">
                      {value === null || value === ""
                        ? "—"
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Bien lié */}
          {lead.bien && (
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Bien concerné
              </h2>
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  <Home className="h-4 w-4 text-neutral-400" />
                  <span className="font-medium">{lead.bien.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/biens/${lead.bien.id}`}
                    className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-primary"
                  >
                    Édition admin <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/properties/${lead.bien.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-primary"
                  >
                    Page publique <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Source URL */}
          {lead.source_url && (
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Provenance
              </h2>
              <p className="text-xs text-neutral-600">
                Soumis depuis : <code className="bg-stone-100 px-1.5 py-0.5 rounded">{lead.source_url}</code>
              </p>
            </section>
          )}

          {/* Notes */}
          <LeadNotes id={lead.id} initialNotes={lead.notes} />
        </div>

        {/* Sidebar : status + actions */}
        <aside className="lg:sticky lg:top-32 space-y-4">
          <LeadActions id={lead.id} currentStatus={lead.status} />

          {lead.handled_at && (
            <div className="rounded-xl border border-stone-200 bg-white p-5 text-xs">
              <h3 className="font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Suivi
              </h3>
              <p className="text-neutral-600">
                Pris en charge le {formatDateTime(lead.handled_at)}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
