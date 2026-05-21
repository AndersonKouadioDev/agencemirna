"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `services` (les 6 prestations métier
 * de l'agence : Vente, Gestion immobilière, Location meublée, Décoration,
 * Construction, Promotion immobilière).
 *
 * Périmètre : ces services sont **fixes** (seedés via migration). Le back-office
 * permet de les éditer, réordonner, activer/désactiver : mais pas de créer
 * de nouveaux services ni d'en supprimer.
 */

// ============================================================================
// Types
// ============================================================================

export type ServiceAdminRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  icon: string | null;
  image: string | null;
  highlights: string[];
  cta_label: string | null;
  cta_url: string | null;
  ordre: number;
  is_active: boolean;
  updated_at: string;
};

export type ServiceFormData = {
  id: string; // toujours update (jamais create)
  name: string;
  short_description?: string | null;
  long_description?: string | null;
  icon?: string | null;
  image?: string | null;
  highlights?: string[];
  cta_label?: string | null;
  cta_url?: string | null;
  ordre?: number;
  is_active?: boolean;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ============================================================================
// LIST
// ============================================================================

export async function listServicesAdmin(): Promise<ServiceAdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_description, long_description, icon, image, highlights, cta_label, cta_url, ordre, is_active, updated_at",
    )
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("listServicesAdmin error:", error);
    return [];
  }

  return data.map(normalizeService);
}

// ============================================================================
// GET (édition)
// ============================================================================

export async function getServiceAdmin(
  id: string,
): Promise<ServiceAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_description, long_description, icon, image, highlights, cta_label, cta_url, ordre, is_active, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getServiceAdmin error:", error);
    return null;
  }
  return normalizeService(data);
}

// ============================================================================
// UPSERT (update uniquement : pas de create)
// ============================================================================

export async function upsertService(
  input: ServiceFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.id) return { ok: false, error: "ID manquant." };
  if (!input.name?.trim()) {
    return { ok: false, error: "Le nom est obligatoire." };
  }

  const supabase = await createClient();

  // Nettoyer les highlights (retire les chaînes vides)
  const cleanHighlights = (input.highlights ?? [])
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  const updateData = {
    name: input.name.trim(),
    short_description: input.short_description?.trim() || null,
    long_description: input.long_description?.trim() || null,
    icon: input.icon?.trim() || null,
    image: input.image?.trim() || null,
    highlights: cleanHighlights,
    cta_label: input.cta_label?.trim() || null,
    cta_url: input.cta_url?.trim() || null,
    ordre: input.ordre ?? 0,
    is_active: input.is_active ?? true,
  };

  const { error } = await supabase
    .from("services")
    .update(updateData)
    .eq("id", input.id);

  if (error) {
    console.error("upsertService error:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true, data: { id: input.id } };
}

// ============================================================================
// TOGGLE ACTIVE (action rapide depuis la liste)
// ============================================================================

export async function toggleServiceActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true, data: undefined };
}

// ============================================================================
// REORDER (drag-to-reorder côté admin)
// ============================================================================

export async function reorderServices(
  ids: string[],
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();

  // Update chaque service avec son nouvel ordre
  const updates = ids.map((id, ordre) =>
    supabase.from("services").update({ ordre: ordre + 1 }).eq("id", id),
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return { ok: false, error: errors[0].error!.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true, data: undefined };
}

// ============================================================================
// REDIRECT helper (form action)
// ============================================================================

export async function upsertServiceAndRedirect(input: ServiceFormData) {
  const result = await upsertService(input);
  if (result.ok) {
    redirect("/admin/services?flash=updated");
  }
  return result;
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeService(raw: {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  icon: string | null;
  image: string | null;
  highlights: unknown;
  cta_label: string | null;
  cta_url: string | null;
  ordre: number;
  is_active: boolean;
  updated_at: string;
}): ServiceAdminRow {
  return {
    ...raw,
    highlights: Array.isArray(raw.highlights)
      ? (raw.highlights as string[])
      : [],
  };
}
