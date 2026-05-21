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

  // handled_at = maintenant uniquement à la 1ère transition hors de 'new'
  const update: {
    status: LeadStatus;
    handled_by?: string;
    handled_at?: string;
  } = { status };
  if (status !== "new") {
    update.handled_by = admin.id;
    update.handled_at = new Date().toISOString();
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
