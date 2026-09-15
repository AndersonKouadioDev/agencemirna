"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { cleIconeValide } from "@/src/lib/bandeau-icones";
import { JETON_TELEPHONE } from "@/src/lib/bandeau";

/**
 * Le bandeau défilant du haut de site, piloté depuis /admin/bandeau.
 *
 * Toutes les écritures purgent « / » en portée `layout` : le bandeau est monté
 * dans le layout marketing, et une purge de la seule page d'accueil laissait
 * les sept pages `force-static` sous /services défiler l'ancien contenu
 * indéfiniment.
 */

const SELECT =
  "id, texte, lien, icone, ordre, is_active, starts_at, ends_at, updated_at";

export type InfoBandeauRow = {
  id: string;
  texte: string;
  lien: string | null;
  icone: string;
  ordre: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string;
};

export type InfoBandeauFormData = {
  id?: string;
  texte: string;
  lien?: string | null;
  icone?: string;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Traduit l'absence de table en message actionnable.
 *
 * Sans cela, l'admin qui ouvre /admin/bandeau avant d'avoir appliqué le SQL
 * lit « relation "public.infos_bandeau" does not exist » et n'a aucune idée
 * de ce qu'on attend de lui.
 */
function formatErreurBandeau(brut: string): string {
  const m = brut.toLowerCase();
  if (
    m.includes("infos_bandeau") &&
    (m.includes("does not exist") ||
      m.includes("schema cache") ||
      m.includes("could not find"))
  ) {
    return (
      "Le bandeau demande la migration 0026_bandeau_et_parametres.sql, qui " +
      "n'a pas encore été appliquée. Ouvre Supabase → SQL Editor, exécute le " +
      "contenu de supabase/migrations/0026_bandeau_et_parametres.sql, puis " +
      `réessaie. (détail : ${brut})`
    );
  }
  return brut;
}

// ============================================================================
// Lecture
// ============================================================================

export async function listInfosBandeau(): Promise<InfoBandeauRow[]> {
  const admin = await getAdminUser();
  if (!admin) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("infos_bandeau")
    .select(SELECT)
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("listInfosBandeau error:", error);
    return [];
  }
  return data as InfoBandeauRow[];
}

// ============================================================================
// Contrôles de saisie
// ============================================================================

/**
 * Une destination utilisable telle quelle dans un `<Link>`.
 *
 * Le champ est libre et part directement dans un `href`. « agencemirna.com/x »
 * serait résolu comme un chemin RELATIF à la page courante et produirait un
 * 404 ; un `javascript:` serait pire. Le jeton {telephone} est accepté : il est
 * remplacé au rendu par le numéro de /admin/parametres, ce qui évite de saisir
 * le même numéro à deux endroits.
 */
function verifierLien(valeur: string | null | undefined): string | null {
  const v = valeur?.trim();
  if (!v) return null;
  if (v === JETON_TELEPHONE) return null;
  // « //hote » est une URL absolue déguisée en chemin, et l'antislash vaut un
  // slash dans la résolution d'URL des navigateurs.
  if (v.slice(0, 2).replace(/\\/g, "/") === "//") {
    return "Lien invalide : « // » sort du site. Utilisez un chemin interne commençant par « / » ou une URL complète https://…";
  }
  if (v.startsWith("/")) return null;
  if (/^https?:\/\//i.test(v)) return null;
  return (
    "Lien invalide : indiquez un chemin interne (« /contact_us »), une URL " +
    `complète (« https://… »), ou ${JETON_TELEPHONE} pour le numéro de l'agence.`
  );
}

function verifierFenetre(
  debut: string | null | undefined,
  fin: string | null | undefined,
): string | null {
  if (!debut || !fin) return null;
  return new Date(debut) < new Date(fin)
    ? null
    : "La date de fin doit être après la date de début.";
}

// ============================================================================
// Écriture
// ============================================================================

export async function upsertInfoBandeau(
  input: InfoBandeauFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const texte = input.texte?.trim();
  if (!texte) return { ok: false, error: "Le texte est obligatoire." };
  if (texte.length > 160) {
    return {
      ok: false,
      error:
        "Message trop long (160 caractères maximum) : le bandeau défile, " +
        "un texte long ne se lit pas.",
    };
  }

  const erreurLien = verifierLien(input.lien);
  if (erreurLien) return { ok: false, error: erreurLien };

  const erreurFenetre = verifierFenetre(input.starts_at, input.ends_at);
  if (erreurFenetre) return { ok: false, error: erreurFenetre };

  // Une clé inconnue s'afficherait avec le pictogramme neutre, sans rien
  // signaler : on la refuse à la saisie plutôt que de la laisser filer.
  const icone = input.icone?.trim() || "megaphone";
  if (!cleIconeValide(icone)) {
    return { ok: false, error: `Pictogramme inconnu : « ${icone} ».` };
  }

  const supabase = await createClient();

  const data = {
    texte,
    lien: input.lien?.trim() || null,
    icone,
    is_active: input.is_active ?? true,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
  };

  if (input.id) {
    const { error } = await supabase
      .from("infos_bandeau")
      .update(data)
      .eq("id", input.id);
    if (error) return { ok: false, error: formatErreurBandeau(error.message) };
    revaliderBandeau();
    return { ok: true, data: { id: input.id } };
  }

  // Nouvelle information : elle se range en fin de bandeau.
  const { data: dernier } = await supabase
    .from("infos_bandeau")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const ordre = ((dernier?.[0]?.ordre as number | undefined) ?? 0) + 10;

  const { data: cree, error } = await supabase
    .from("infos_bandeau")
    .insert({ ...data, ordre })
    .select("id")
    .single();

  if (error || !cree) {
    return {
      ok: false,
      error: formatErreurBandeau(error?.message ?? "Erreur de création."),
    };
  }
  revaliderBandeau();
  return { ok: true, data: { id: cree.id as string } };
}

export async function deleteInfoBandeau(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase.from("infos_bandeau").delete().eq("id", id);
  if (error) return { ok: false, error: formatErreurBandeau(error.message) };

  revaliderBandeau();
  return { ok: true, data: undefined };
}

export async function toggleInfoBandeau(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("infos_bandeau")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: formatErreurBandeau(error.message) };

  revaliderBandeau();
  return { ok: true, data: undefined };
}

export async function reorderInfosBandeau(ids: string[]): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  // Pas de sur-place : on renumérote par pas de 10, ce qui laisse de la marge
  // pour insérer une ligne entre deux sans tout réécrire.
  const resultats = await Promise.all(
    ids.map((id, i) =>
      supabase
        .from("infos_bandeau")
        .update({ ordre: (i + 1) * 10 })
        .eq("id", id),
    ),
  );
  const echec = resultats.find((r) => r.error);
  if (echec?.error) {
    return { ok: false, error: formatErreurBandeau(echec.error.message) };
  }

  revaliderBandeau();
  return { ok: true, data: undefined };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Non exporté : un module « use server » ne peut exporter que des fonctions
 * async, et surtout chaque export y devient un endpoint POST public.
 */
function revaliderBandeau() {
  revalidatePath("/admin/bandeau");
  // Portée « layout » : le bandeau est dans le layout marketing, et les pages
  // sous /services sont en `force-static`.
  revalidatePath("/", "layout");
}
