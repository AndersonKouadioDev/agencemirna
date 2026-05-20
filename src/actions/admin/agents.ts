"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `agents` (équipe de l'agence).
 * CRUD complet : create, list, get, update, delete + toggle is_active.
 */

// ============================================================================
// Types
// ============================================================================

export type AgentAdminRow = {
  id: string;
  full_name: string;
  role: string | null;
  photo: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  specialites: string[];
  is_active: boolean;
  ordre: number;
  updated_at: string;
};

export type AgentFormData = {
  id?: string;
  full_name: string;
  role?: string | null;
  photo?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  specialites?: string[];
  is_active?: boolean;
  ordre?: number;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ============================================================================
// LIST
// ============================================================================

export async function listAgentsAdmin(): Promise<AgentAdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, full_name, role, photo, bio, phone, email, whatsapp, specialites, is_active, ordre, updated_at",
    )
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("listAgentsAdmin error:", error);
    return [];
  }
  return data.map(normalizeAgent);
}

// ============================================================================
// GET
// ============================================================================

export async function getAgentAdmin(
  id: string,
): Promise<AgentAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, full_name, role, photo, bio, phone, email, whatsapp, specialites, is_active, ordre, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getAgentAdmin error:", error);
    return null;
  }
  return normalizeAgent(data);
}

// ============================================================================
// UPSERT
// ============================================================================

export async function upsertAgent(
  input: AgentFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.full_name?.trim()) {
    return { ok: false, error: "Le nom complet est obligatoire." };
  }

  const supabase = await createClient();

  const cleanSpecialites = (input.specialites ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const data = {
    full_name: input.full_name.trim(),
    role: input.role?.trim() || null,
    photo: input.photo?.trim() || null,
    bio: input.bio?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    specialites: cleanSpecialites,
    is_active: input.is_active ?? true,
    ordre: input.ordre ?? 0,
  };

  if (input.id) {
    const { error } = await supabase
      .from("agents")
      .update(data)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/agents");
    revalidatePath("/agents");
    return { ok: true, data: { id: input.id } };
  } else {
    // Auto-ordre : prend max(ordre) + 1
    const { data: existing } = await supabase
      .from("agents")
      .select("ordre")
      .order("ordre", { ascending: false })
      .limit(1);
    const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;

    const { data: created, error } = await supabase
      .from("agents")
      .insert({ ...data, ordre: nextOrdre })
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: error?.message ?? "Erreur de création." };
    }
    revalidatePath("/admin/agents");
    revalidatePath("/agents");
    return { ok: true, data: { id: created.id as string } };
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteAgent(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/agents");
  revalidatePath("/agents");
  return { ok: true, data: undefined };
}

// ============================================================================
// TOGGLE ACTIVE
// ============================================================================

export async function toggleAgentActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/agents");
  revalidatePath("/agents");
  return { ok: true, data: undefined };
}

// ============================================================================
// REORDER
// ============================================================================

export async function reorderAgents(ids: string[]): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const updates = ids.map((id, ordre) =>
    supabase.from("agents").update({ ordre: ordre + 1 }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) return { ok: false, error: errors[0].error!.message };

  revalidatePath("/admin/agents");
  revalidatePath("/agents");
  return { ok: true, data: undefined };
}

// ============================================================================
// Redirect helper
// ============================================================================

export async function upsertAgentAndRedirect(input: AgentFormData) {
  const result = await upsertAgent(input);
  if (result.ok) {
    redirect("/admin/agents?flash=saved");
  }
  return result;
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeAgent(raw: {
  id: string;
  full_name: string;
  role: string | null;
  photo: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  specialites: unknown;
  is_active: boolean;
  ordre: number;
  updated_at: string;
}): AgentAdminRow {
  return {
    ...raw,
    specialites: Array.isArray(raw.specialites)
      ? (raw.specialites as string[])
      : [],
  };
}
