"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

export type SiteSettingsRow = {
  id: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  updated_at: string;
};

export type SiteSettingsFormData = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error || !data) return null;
  return data as SiteSettingsRow;
}

export async function upsertSiteSettings(input: SiteSettingsFormData): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const current = await getSiteSettings();

  const data = {
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    facebook: input.facebook || null,
    instagram: input.instagram || null,
    linkedin: input.linkedin || null,
  };

  if (current) {
    const { error } = await supabase.from("site_settings").update(data).eq("id", current.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("site_settings").insert(data);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
