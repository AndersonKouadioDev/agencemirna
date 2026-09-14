/**
 * Notifications par email aux administrateurs lors d'événements clés
 * (nouveau lead, etc.). Utilise Resend (https://resend.com) via leur API
 * REST sans dépendance lourde.
 *
 * Configuration env requise :
 *   - RESEND_API_KEY            : clé API Resend (obligatoire pour activer)
 *   - NOTIFY_EMAIL_FROM         : adresse expéditrice (ex: 'Mirna <noreply@agencemirna.com>')
 *                                 par défaut 'Mirna <onboarding@resend.dev>' (compte test Resend)
 *   - NOTIFY_EMAIL_TO           : surcharge d'exploitation du destinataire.
 *                                 À défaut, on prend l'adresse saisie dans
 *                                 /admin/parametres (site_settings.email).
 *   - NEXT_PUBLIC_SITE_URL      : base URL pour les liens admin (ex: https://www.agencemirna.com)
 *
 * Comportement :
 *   - Si RESEND_API_KEY est absent : on log juste et on renvoie { ok: true,
 *     skipped: true } pour ne pas faire échouer le createLead.
 *   - Si erreur Resend : on log, on renvoie { ok: false } mais le lead est
 *     déjà créé en DB (l'email est best-effort).
 */

import { getSiteContact } from "./site-contact";

export type NotifyResult =
  | { ok: true; skipped?: boolean; messageId?: string }
  | { ok: false; error: string };

type SendEmailInput = {
  subject: string;
  html: string;
  text: string;
  to?: string;
};

async function sendEmail(input: SendEmailInput): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[notify] RESEND_API_KEY absent, email skipped:", input.subject);
    return { ok: true, skipped: true };
  }

  const from = process.env.NOTIFY_EMAIL_FROM ?? "Mirna <onboarding@resend.dev>";
  const to = input.to ?? process.env.NOTIFY_EMAIL_TO ?? "info@agencemirna.com";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[notify] Resend error:", res.status, errBody);
      return { ok: false, error: `Resend ${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, messageId: data.id };
  } catch (e) {
    console.error("[notify] sendEmail exception:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erreur réseau",
    };
  }
}

// ============================================================================
// Notification : nouveau lead
// ============================================================================

/**
 * La policy publique de `leads` autorise l'INSERT anonyme : nom, message,
 * email et métadonnées arrivent d'un visiteur non authentifié et repartent
 * tels quels dans un gabarit HTML. Sans échappement, un message peut donc
 * poser dans la boîte de l'administrateur un faux bouton « Voir dans
 * l'admin » pointant ailleurs, ou casser la mise en page de l'alerte. Le
 * corps texte, lui, n'a rien à échapper.
 */
function echapperHtml(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Le numéro arrive tel qu'un visiteur l'a tapé, donc avec espaces, points ou
 * parenthèses. Une cible `tel:` ne se compose de façon fiable que sur des
 * chiffres et un éventuel « + » : le texte affiché garde la saisie d'origine,
 * seul le lien est normalisé.
 */
function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

const SOURCE_LABELS: Record<string, string> = {
  contact: "Formulaire de contact",
  estimation: "Demande d'estimation",
  visit_request: "Demande de visite",
  newsletter: "Inscription newsletter",
  other: "Autre",
};

export async function notifyNewLead(lead: {
  id: string;
  source: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  bien_name?: string | null;
}): Promise<NotifyResult> {
  // Le destinataire suit l'adresse saisie en back-office : sans ça, changer
  // l'email dans /admin/parametres n'avait aucun effet sur les notifications,
  // qui partaient toujours vers l'adresse codée en dur de sendEmail().
  // NOTIFY_EMAIL_TO reste prioritaire comme surcharge d'exploitation, mais une
  // variable déclarée à vide (accident courant sur un hébergeur) doit valoir
  // « non configurée », sinon `??` la retiendrait et l'email partirait vers "".
  const surcharge = process.env.NOTIFY_EMAIL_TO?.trim();
  const to = surcharge || (await getSiteContact()).email;

  const sourceLabel = SOURCE_LABELS[lead.source] ?? lead.source;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";
  const adminLink = `${siteUrl}/admin/leads/${lead.id}`;

  const subject = `[Mirna] Nouveau lead ${sourceLabel}${
    lead.full_name ? " : " + lead.full_name : ""
  }`;

  const metaRows = lead.metadata
    ? Object.entries(lead.metadata)
        .filter(([, v]) => v !== null && v !== "")
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:0.05em">${echapperHtml(k.replace(/_/g, " "))}</td><td style="padding:4px 0;color:#111827"><strong>${echapperHtml(String(v))}</strong></td></tr>`,
        )
        .join("")
    : "";

  const html = `
<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#FAF5EE;margin:0;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">
    <div style="background:#1f1208;color:white;padding:24px 32px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#f59e0b;margin-bottom:4px">${echapperHtml(sourceLabel)}</div>
      <h1 style="margin:0;font-size:22px;font-weight:700">Nouveau lead reçu</h1>
    </div>
    <div style="padding:24px 32px">
      ${lead.full_name ? `<p style="margin:0 0 4px;font-size:18px;font-weight:600;color:#1f1208">${echapperHtml(lead.full_name)}</p>` : ""}
      ${lead.email ? `<p style="margin:4px 0;color:#374151"><a href="mailto:${echapperHtml(lead.email)}" style="color:#f59e0b;text-decoration:none">${echapperHtml(lead.email)}</a></p>` : ""}
      ${lead.phone ? `<p style="margin:4px 0;color:#374151"><a href="tel:${telHref(lead.phone)}" style="color:#f59e0b;text-decoration:none">${echapperHtml(lead.phone)}</a></p>` : ""}

      ${lead.bien_name ? `<p style="margin:16px 0 0;padding:12px;background:#fef3c7;border-radius:8px;font-size:14px"><strong>Bien concerné :</strong> ${echapperHtml(lead.bien_name)}</p>` : ""}

      ${
        lead.message
          ? `<div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #f59e0b">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin-bottom:8px">Message</div>
              <p style="margin:0;white-space:pre-wrap;color:#1f1208;line-height:1.5">${echapperHtml(lead.message)}</p>
            </div>`
          : ""
      }

      ${
        metaRows
          ? `<table style="margin-top:16px;width:100%;border-collapse:collapse"><tbody>${metaRows}</tbody></table>`
          : ""
      }

      <div style="margin-top:32px;text-align:center">
        <a href="${adminLink}" style="display:inline-block;background:#f59e0b;color:white;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;font-size:14px">Voir dans l'admin →</a>
      </div>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f5f5f4;color:#9ca3af;font-size:11px;text-align:center">
      Notification automatique Agence Mirna
    </div>
  </div>
</body></html>`;

  const text = [
    `Nouveau lead reçu — ${sourceLabel}`,
    "",
    lead.full_name ? `Nom : ${lead.full_name}` : "",
    lead.email ? `Email : ${lead.email}` : "",
    lead.phone ? `Téléphone : ${lead.phone}` : "",
    lead.bien_name ? `Bien : ${lead.bien_name}` : "",
    lead.message ? `\nMessage :\n${lead.message}` : "",
    "",
    `Voir dans l'admin : ${adminLink}`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({ subject, html, text, to });
}
