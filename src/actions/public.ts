"use server";

import { createClient } from "../supabase/server";

// ============================================================================
// Données de référence pour filtres publics (types, services, catégories)
// ============================================================================

export type BienReferenceData = {
  types: { id: number; name: string }[];
  services: { id: number; name: string }[];
  categories: { id: number; name: string }[];
};

/**
 * Charge les listes types/services/categories utilisées pour peupler
 * les dropdowns des filtres sur /properties (et autres pages publiques).
 * Lecture publique — aucune restriction RLS sur ces tables référentielles.
 */
export async function getBienReferenceData(): Promise<BienReferenceData> {
  const supabase = await createClient();

  const [typesRes, servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from("types_bien")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("services_bien")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("categories_bien")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  return {
    types: (typesRes.data ?? []).filter((t) => t.name) as {
      id: number;
      name: string;
    }[],
    services: (servicesRes.data ?? []).filter((s) => s.name) as {
      id: number;
      name: string;
    }[],
    categories: (categoriesRes.data ?? []).filter((c) => c.name) as {
      id: number;
      name: string;
    }[],
  };
}

/**
 * Server Actions de lecture publique pour le site marketing.
 * Toutes ces actions vont à travers les RLS policies qui filtrent
 * automatiquement les rows inactives / hors plage de dates.
 */

// ============================================================================
// Services
// ============================================================================

export type PublicService = {
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
};

export async function getActiveServices(): Promise<PublicService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_description, long_description, icon, image, highlights, cta_label, cta_url, ordre",
    )
    // RLS filtre déjà is_active=true
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("getActiveServices error:", error);
    return [];
  }
  return data.map((s) => ({
    ...s,
    highlights: Array.isArray(s.highlights) ? (s.highlights as string[]) : [],
  }));
}

export async function getServiceBySlug(
  slug: string,
): Promise<PublicService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_description, long_description, icon, image, highlights, cta_label, cta_url, ordre",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getServiceBySlug error:", error);
    return null;
  }
  return {
    ...data,
    highlights: Array.isArray(data.highlights)
      ? (data.highlights as string[])
      : [],
  };
}

// ============================================================================
// Promotions
// ============================================================================

export type PublicPromotion = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  show_on_home: boolean;
};

export async function getActivePromotions(): Promise<PublicPromotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, title, description, image, cta_label, cta_url, starts_at, ends_at, show_on_home",
    )
    // RLS filtre déjà is_active=true ET dans plage de dates
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("getActivePromotions error:", error);
    return [];
  }
  return data as PublicPromotion[];
}

/**
 * Retourne la promo à afficher sur la home (1 seule, la 1ère trouvée
 * avec show_on_home=true), ou null si aucune.
 */
export async function getHomePromotion(): Promise<PublicPromotion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, title, description, image, cta_label, cta_url, starts_at, ends_at, show_on_home",
    )
    .eq("show_on_home", true)
    .order("ordre", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicPromotion;
}

// ============================================================================
// Agents
// ============================================================================

export type PublicAgent = {
  id: string;
  full_name: string;
  role: string | null;
  photo: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  specialites: string[];
  ordre: number;
};

export async function getActiveAgents(): Promise<PublicAgent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, full_name, role, photo, bio, phone, email, whatsapp, specialites, ordre",
    )
    // RLS filtre déjà is_active=true
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("getActiveAgents error:", error);
    return [];
  }
  return data.map((a) => ({
    ...a,
    specialites: Array.isArray(a.specialites)
      ? (a.specialites as string[])
      : [],
  }));
}
