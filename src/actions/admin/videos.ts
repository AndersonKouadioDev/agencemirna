"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `videos`.
 *
 * Une vidéo a une `url` (YouTube, Vimeo ou fichier .mp4 direct) et
 * optionnellement un `poster` (image affichée avant lecture).
 *
 * Logique d'affichage public :
 *   - Section vidéo home : la 1ère vidéo active avec show_on_home=true,
 *     triée par ordre.
 *   - Pas de vidéo correspondante → la section ne s'affiche pas.
 */

// ============================================================================
// Types
// ============================================================================

export type VideoAdminRow = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  poster: string | null;
  show_on_home: boolean;
  is_active: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
};

export type VideoFormData = {
  id?: string;
  title: string;
  description?: string | null;
  url: string;
  poster?: string | null;
  show_on_home?: boolean;
  is_active?: boolean;
  ordre?: number;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ============================================================================
// LIST
// ============================================================================

export async function listVideosAdmin(): Promise<VideoAdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, url, poster, show_on_home, is_active, ordre, created_at, updated_at",
    )
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("listVideosAdmin error:", error);
    return [];
  }
  return data as VideoAdminRow[];
}

// ============================================================================
// GET ONE
// ============================================================================

export async function getVideoAdmin(id: string): Promise<VideoAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, url, poster, show_on_home, is_active, ordre, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getVideoAdmin error:", error);
    return null;
  }
  return data as VideoAdminRow;
}

// ============================================================================
// UPSERT
// ============================================================================

export async function upsertVideo(
  input: VideoFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.title?.trim()) {
    return { ok: false, error: "Le titre est obligatoire." };
  }
  if (!input.url?.trim()) {
    return {
      ok: false,
      error:
        "L'URL de la vidéo est obligatoire (YouTube, Vimeo, ou lien direct .mp4).",
    };
  }

  // Validation basique de l'URL : doit être parsable
  try {
    new URL(input.url.trim());
  } catch {
    return { ok: false, error: "URL invalide." };
  }

  const supabase = await createClient();

  const data = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    url: input.url.trim(),
    poster: input.poster?.trim() || null,
    show_on_home: input.show_on_home ?? true,
    is_active: input.is_active ?? true,
    ordre: input.ordre ?? 0,
  };

  if (input.id) {
    const { error } = await supabase
      .from("videos")
      .update(data)
      .eq("id", input.id);
    if (error) {
      console.error("upsertVideo update error:", error);
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin/videos");
    revalidatePath("/");
    return { ok: true, data: { id: input.id } };
  } else {
    // INSERT : ordre auto = max + 1
    const { data: existing } = await supabase
      .from("videos")
      .select("ordre")
      .order("ordre", { ascending: false })
      .limit(1);
    const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;

    const { data: created, error } = await supabase
      .from("videos")
      .insert({ ...data, ordre: nextOrdre })
      .select("id")
      .single();
    if (error || !created) {
      console.error("upsertVideo insert error:", error);
      return { ok: false, error: error?.message ?? "Erreur de création." };
    }
    revalidatePath("/admin/videos");
    revalidatePath("/");
    return { ok: true, data: { id: created.id as string } };
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteVideo(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

// ============================================================================
// TOGGLES (active, show_on_home)
// ============================================================================

export async function toggleVideoActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("videos")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

export async function toggleVideoOnHome(
  id: string,
  show: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("videos")
    .update({ show_on_home: show })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

// ============================================================================
// Redirect helper
// ============================================================================

export async function upsertVideoAndRedirect(input: VideoFormData) {
  const result = await upsertVideo(input);
  if (result.ok) {
    redirect("/admin/videos?flash=saved");
  }
  return result;
}
