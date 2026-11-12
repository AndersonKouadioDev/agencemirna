"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `leads` : centralise les demandes
 * entrantes du site (formulaires contact, estimation, demande de visite,
 * newsletter). Permet à l'admin de :
 *   - lister avec filtres (source, status)
 *   - voir le détail d'un lead avec son bien rattaché si applicable
 *   - changer le statut (new → in_progress → qualified → converted /
 *     rejected / archived)
 *   - ajouter des notes internes
 *   - supprimer
 *   - changer le statut ou supprimer plusieurs leads d'un coup
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type LeadStatus =
  | "new"
  | "in_progress"
  | "qualified"
  | "converted"
  | "rejected"
  | "archived";

export type LeadSource =
  | "contact"
  | "estimation"
  | "visit_request"
  | "newsletter"
  | "other";

export type LeadRow = {
  id: string;
  source: LeadSource;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  bien_id: string | null;
  source_url: string | null;
  metadata: Record<string, unknown> | null;
  status: LeadStatus;
  handled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joint sur bien (optionnel)
  bien?: { id: string; name: string | null } | null;
};

export type LeadFilters = {
  status?: LeadStatus | "all";
  source?: LeadSource | "all";
};

export async function listLeadsAdmin(
  filters?: LeadFilters,
): Promise<LeadRow[]> {
  // Ce module est « use server » : chaque export devient un endpoint POST
  // atteignable sans session. La RLS de `leads` filtre déjà, mais la garde
  // doit être ici aussi, comme sur les mutations plus bas.
  const admin = await getAdminUser();
  if (!admin) return [];

  const supabase = await createClient();
  let q = supabase
    .from("leads")
    .select(
      "id, source, full_name, email, phone, message, bien_id, source_url, metadata, status, handled_at, notes, created_at, updated_at, bien:bien_id(id, name)",
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    q = q.eq("status", filters.status);
  }
  if (filters?.source && filters.source !== "all") {
    q = q.eq("source", filters.source);
  }

  const { data, error } = await q;
  if (error || !data) {
    if (error) console.error("listLeadsAdmin error:", error);
    return [];
  }
  return data as unknown as LeadRow[];
}

export async function getLeadAdmin(id: string): Promise<LeadRow | null> {
  // Ce module est « use server » : chaque export devient un endpoint POST
  // atteignable sans session. La RLS de `leads` filtre déjà, mais la garde
  // doit être ici aussi, comme sur les mutations plus bas.
  const admin = await getAdminUser();
  if (!admin) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select(
      "id, source, full_name, email, phone, message, bien_id, source_url, metadata, status, handled_at, notes, created_at, updated_at, bien:bien_id(id, name)",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as LeadRow) ?? null;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();

  const update: {
    status: LeadStatus;
    handled_by?: string;
    handled_at?: string;
  } = { status };
  if (status !== "new") {
    update.handled_by = admin.id;
    // `handled_at` date la PREMIÈRE prise en charge : la réécrire à chaque
    // changement de statut faisait passer un lead traité il y a trois semaines
    // pour un lead traité aujourd'hui, dès qu'on le marquait « Converti ».
    const { data: existant } = await supabase
      .from("leads")
      .select("handled_at")
      .eq("id", id)
      .maybeSingle();
    if (!existant?.handled_at) {
      update.handled_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true, data: undefined };
}

export async function updateLeadNotes(
  id: string,
  notes: string,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ notes: notes.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true, data: undefined };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true, data: undefined };
}

// ============================================================================
// Actions groupées (cases à cocher de /admin/leads)
// ============================================================================

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUTS: readonly LeadStatus[] = [
  "new",
  "in_progress",
  "qualified",
  "converted",
  "rejected",
  "archived",
];
/** Au-delà d'environ 200 identifiants, l'URL de la requête PostgREST devient trop longue. */
const TAILLE_LOT = 100;
const SELECTION_MAX = 5000;

/** Identifiants dédoublonnés, ou `null` si la sélection n'est pas exploitable. */
function selectionValide(ids: unknown): string[] | null {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > SELECTION_MAX) {
    return null;
  }
  const uniques = [...new Set(ids)];
  return uniques.every((id) => typeof id === "string" && UUID.test(id))
    ? (uniques as string[])
    : null;
}

function enLots<T>(liste: T[]): T[][] {
  const lots: T[][] = [];
  for (let i = 0; i < liste.length; i += TAILLE_LOT) {
    lots.push(liste.slice(i, i + TAILLE_LOT));
  }
  return lots;
}

export async function deleteLeads(
  ids: string[],
): Promise<ActionResult<{ supprimes: number }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const selection = selectionValide(ids);
  if (!selection) return { ok: false, error: "Sélection invalide." };

  const supabase = await createClient();
  let supprimes = 0;
  for (const lot of enLots(selection)) {
    const { error, count } = await supabase
      .from("leads")
      .delete({ count: "exact" })
      .in("id", lot);
    if (error) {
      revalidatePath("/admin/leads");
      return {
        ok: false,
        error: supprimes
          ? `${supprimes} lead(s) supprimé(s), puis échec : ${error.message}`
          : error.message,
      };
    }
    supprimes += count ?? 0;
  }

  revalidatePath("/admin/leads");
  return { ok: true, data: { supprimes } };
}

export async function updateLeadsStatus(
  ids: string[],
  status: LeadStatus,
): Promise<ActionResult<{ modifies: number }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const selection = selectionValide(ids);
  if (!selection) return { ok: false, error: "Sélection invalide." };
  if (!STATUTS.includes(status)) return { ok: false, error: "Statut inconnu." };

  const supabase = await createClient();
  const maintenant = new Date().toISOString();
  let modifies = 0;
  for (const lot of enLots(selection)) {
    // Mêmes règles que `updateLeadStatus` : `handled_by` suit la dernière
    // prise en main, `handled_at` ne date que la première (d'où le filtre
    // `is null` de la seconde requête).
    const { error, count } = await supabase
      .from("leads")
      .update(status === "new" ? { status } : { status, handled_by: admin.id }, {
        count: "exact",
      })
      .in("id", lot);
    if (!error && status !== "new") {
      await supabase
        .from("leads")
        .update({ handled_at: maintenant })
        .in("id", lot)
        .is("handled_at", null);
    }
    if (error) {
      revalidatePath("/admin/leads");
      return {
        ok: false,
        error: modifies
          ? `${modifies} lead(s) modifié(s), puis échec : ${error.message}`
          : error.message,
      };
    }
    modifies += count ?? 0;
  }

  revalidatePath("/admin/leads");
  return { ok: true, data: { modifies } };
}

// ============================================================================
// Compteurs pour le dashboard admin
// ============================================================================

export type LeadStats = {
  total: number;
  new: number;
  in_progress: number;
  converted: number;
  this_week: number;
};

export async function getLeadStats(): Promise<LeadStats> {
  // Ce module est « use server » : chaque export devient un endpoint POST
  // atteignable sans session. La RLS de `leads` filtre déjà, mais la garde
  // doit être ici aussi, comme sur les mutations plus bas.
  const admin = await getAdminUser();
  if (!admin) return { total: 0, new: 0, in_progress: 0, converted: 0, this_week: 0 };

  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [total, newCount, inProgress, converted, thisWeek] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "converted"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
  ]);

  return {
    total: total.count ?? 0,
    new: newCount.count ?? 0,
    in_progress: inProgress.count ?? 0,
    converted: converted.count ?? 0,
    this_week: thisWeek.count ?? 0,
  };
}
