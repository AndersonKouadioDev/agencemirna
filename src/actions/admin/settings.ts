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
  /** Migration 0026. Optionnelles : absentes tant que le SQL n'est pas passé. */
  phone_secondaire?: string | null;
  adresse?: string | null;
  horaires?: string | null;
  whatsapp_message?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  updated_at: string;
};

export type SiteSettingsFormData = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  phone_secondaire?: string;
  adresse?: string;
  horaires?: string;
  whatsapp_message?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Lecture interne, qui distingue les deux cas que `SiteSettingsRow | null`
 * confond : « la lecture a échoué » et « la table est vide ». L'upsert a
 * besoin de cette distinction pour ne jamais insérer une seconde ligne à
 * cause d'une erreur passagère.
 */
type LectureParametres =
  | { ok: true; row: SiteSettingsRow | null }
  | { ok: false; error: string };

async function lireParametres(): Promise<LectureParametres> {
  const supabase = await createClient();
  // `.order()` explicite : `getSiteContact()` trie de la même façon, sinon
  // l'admin éditerait une ligne et la vitrine en afficherait une autre.
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getSiteSettings error:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, row: (data as SiteSettingsRow | null) ?? null };
}

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  // Ce module est « use server » : chaque export est un endpoint POST
  // atteignable sans session. La RLS suffirait aujourd'hui, mais la garde
  // doit exister ici aussi, comme sur les mutations du même fichier.
  const admin = await getAdminUser();
  if (!admin) return null;

  const lecture = await lireParametres();
  return lecture.ok ? lecture.row : null;
}

/**
 * Les trois réseaux sont injectés tels quels dans un `href` du footer :
 * « facebook.com/agencemirna », sans protocole, y produirait un lien relatif
 * menant à une 404 du site. On refuse la saisie plutôt que de l'enregistrer.
 */
function verifierLien(valeur: string | undefined, reseau: string): string | null {
  const v = valeur?.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
  } catch {
    return `Lien ${reseau} invalide : indiquez l'URL complète, « https:// » inclus.`;
  }
  return null;
}

/**
 * L'email n'est plus seulement affiché : `notifyNewLead()` s'en sert comme
 * destinataire des alertes de lead. Une saisie fautive ne se verrait donc
 * qu'au moment où une notification part dans le vide.
 */
function verifierEmail(valeur: string | undefined): string | null {
  const v = valeur?.trim();
  if (!v) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return "Adresse email invalide : les notifications de leads y sont envoyées.";
  }
  return null;
}

export async function upsertSiteSettings(input: SiteSettingsFormData): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const erreurEmail = verifierEmail(input.email);
  if (erreurEmail) return { ok: false, error: erreurEmail };

  for (const [valeur, reseau] of [
    [input.facebook, "Facebook"],
    [input.instagram, "Instagram"],
    [input.linkedin, "LinkedIn"],
    [input.tiktok, "TikTok"],
    [input.youtube, "YouTube"],
    [input.twitter, "X (Twitter)"],
  ] as const) {
    const erreur = verifierLien(valeur, reseau);
    if (erreur) return { ok: false, error: erreur };
  }

  const supabase = await createClient();
  const lecture = await lireParametres();
  // Une lecture en échec n'est pas une table vide : insérer ici créerait une
  // seconde ligne de paramètres, que l'admin et la vitrine liraient ensuite
  // sans garantie de tomber sur la même.
  if (!lecture.ok) {
    return {
      ok: false,
      error: "Impossible de relire les paramètres actuels, enregistrement annulé.",
    };
  }

  const data = {
    phone: input.phone?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    email: input.email?.trim() || null,
    facebook: input.facebook?.trim() || null,
    instagram: input.instagram?.trim() || null,
    linkedin: input.linkedin?.trim() || null,
    phone_secondaire: input.phone_secondaire?.trim() || null,
    adresse: input.adresse?.trim() || null,
    horaires: input.horaires?.trim() || null,
    whatsapp_message: input.whatsapp_message?.trim() || null,
    tiktok: input.tiktok?.trim() || null,
    youtube: input.youtube?.trim() || null,
    twitter: input.twitter?.trim() || null,
  };

  if (lecture.row) {
    const { error } = await supabase.from("site_settings").update(data).eq("id", lecture.row.id);
    if (error) return { ok: false, error: formatErreurParametres(error.message) };
  } else {
    const { error } = await supabase.from("site_settings").insert(data);
    if (error) return { ok: false, error: formatErreurParametres(error.message) };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

/**
 * PostgREST dit « Could not find the 'x' column … in the schema cache » sur une
 * écriture vers une colonne absente. Sans traduction, l'admin lit ce message
 * brut au moment précis où il aurait fallu lui nommer le SQL à appliquer.
 */
function formatErreurParametres(brut: string): string {
  const m = brut.toLowerCase();
  const colonnes0026 = [
    "phone_secondaire", "adresse", "horaires", "whatsapp_message",
    "tiktok", "youtube", "twitter",
  ];
  if (
    colonnes0026.some((c) => m.includes(c)) &&
    (m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist"))
  ) {
    return (
      "Ces champs demandent la migration 0026_bandeau_et_parametres.sql, qui " +
      "n'a pas encore été appliquée. Ouvre Supabase → SQL Editor, exécute-la, " +
      `puis réessaie. (détail : ${brut})`
    );
  }
  return brut;
}
