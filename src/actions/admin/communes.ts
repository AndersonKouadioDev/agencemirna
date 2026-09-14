"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { normaliserUrlImage } from "@/src/lib/image-url";

/**
 * Lectures comprises, chaque export vérifie `getAdminUser()` : un identifiant
 * de Server Action est global, donc POSTable depuis n'importe quelle route, y
 * compris hors de /admin que le middleware est seul à filtrer.
 */

export type CommuneAdminRow = {
  id: string;
  nom: string;
  slug: string;
  is_active: boolean;
  ordre: number;
  updated_at: string;
  // Colonnes de présentation (migration 0015). Seules `tagline`, `image` et
  // `is_featured` ont un rendu public — la carte de « Communes phares ». Les
  // trois autres (badge, description, search_query) restent dans le type
  // parce que la table les porte, mais aucun écran ne les saisit plus.
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string | null;
  search_query: string | null;
  is_featured: boolean;
};

/**
 * Le formulaire n'expose que les champs réellement rendus quelque part.
 * `badge`, `description` et `search_query` en sont volontairement absents :
 * rien ne les affiche, et les laisser dans ce type les aurait remis dans le
 * payload d'update — donc vidés en base à chaque enregistrement.
 */
export type CommuneFormData = {
  id?: string;
  nom: string;
  slug: string;
  is_active?: boolean;
  ordre?: number;
  tagline?: string | null;
  image?: string | null;
  is_featured?: boolean;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listCommunesAdmin(): Promise<CommuneAdminRow[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communes")
    .select("*")
    .order("ordre", { ascending: true });

  if (error || !data) return [];
  return data as CommuneAdminRow[];
}

export async function getCommuneAdmin(id: string): Promise<CommuneAdminRow | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("communes").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as CommuneAdminRow;
}

export type BiensParZone = {
  communes: Record<string, number>;
  quartiers: Record<string, number>;
};

/**
 * Biens rattachés à chaque commune et à chaque quartier, actifs COMME inactifs.
 *
 * `biens.commune_id` et `biens.quartier_id` sont en ON DELETE SET NULL
 * (migration 0015) : supprimer une zone détache ses biens sans un mot, et ces
 * biens disparaissent d'un coup de tous les filtres de lieu — facettes,
 * méga-menu, footer, dropdown Localisation. L'avertissement de suppression
 * doit donc annoncer ce chiffre-là, ce que `getCatalogueFacettes` ne peut pas
 * faire puisqu'il ne compte que les biens actifs.
 */
export async function countBiensParZone(): Promise<BiensParZone> {
  const vide: BiensParZone = { communes: {}, quartiers: {} };
  const admin = await getAdminUser();
  if (!admin) return vide;

  const supabase = await createClient();

  const compter = (bucket: Record<string, number>, cle: unknown) => {
    if (cle === null || cle === undefined) return;
    const k = String(cle);
    bucket[k] = (bucket[k] ?? 0) + 1;
  };

  const resultat: BiensParZone = { communes: {}, quartiers: {} };

  // PostgREST plafonne ses réponses (`db-max-rows`, 1000 sur Supabase hébergé)
  // et tronque SANS erreur : d'un seul `select()`, l'avertissement de
  // suppression aurait fini par annoncer moins de biens qu'il n'en détache
  // réellement, sur l'écran qui sert précisément à mesurer une perte
  // irréversible. La page avance du nombre de lignes effectivement reçues, ce
  // qui reste juste même si le plafond du serveur est plus bas que le pas.
  const PAS = 1000;
  for (let debut = 0; ; ) {
    const { data, error } = await supabase
      .from("biens")
      .select("commune_id, quartier_id")
      // Sans tri, l'ordre des lignes n'est pas garanti stable d'une page à
      // l'autre : un bien pourrait être compté deux fois, ou pas du tout.
      .order("id", { ascending: true })
      .range(debut, debut + PAS - 1);
    if (error || !data) return vide;

    for (const b of data as Array<Record<string, unknown>>) {
      compter(resultat.communes, b.commune_id);
      compter(resultat.quartiers, b.quartier_id);
    }

    if (data.length === 0) break;
    debut += data.length;
  }
  return resultat;
}

/**
 * Les communes alimentent la section « Communes phares » de l'accueil, le
 * méga-menu et les filtres du catalogue : toute écriture doit les revalider,
 * sans quoi une modification reste invisible sur le site.
 */
function revaliderVitrine() {
  // /admin/communes ne contient plus qu'un redirect : la page réellement
  // consommatrice est /admin/geographie.
  revalidatePath("/admin/geographie");
  revalidatePath("/", "layout");
  revalidatePath("/properties");
}

export async function upsertCommune(input: CommuneFormData): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.nom?.trim()) return { ok: false, error: "Le nom est obligatoire." };
  if (!input.slug?.trim()) return { ok: false, error: "Le slug est obligatoire." };

  const supabase = await createClient();

  const nom = input.nom.trim();
  // Le formulaire valide déjà l'adresse saisie, mais l'action est une route
  // publique : sans ce contrôle, une URL que next/image refuse pourrait être
  // écrite directement et casserait la page qui l'affiche.
  const imageValidee = normaliserUrlImage(input.image ?? "");
  if (imageValidee === undefined) {
    return {
      ok: false,
      error:
        "Adresse d'image refusée : indiquez un chemin interne ou une URL "
        + "https servie par un hébergeur déclaré dans next.config.",
    };
  }

  const data = {
    nom,
    slug: input.slug.trim().toLowerCase(),
    is_active: input.is_active ?? true,
    tagline: input.tagline?.trim() || null,
    image: imageValidee,
    is_featured: input.is_featured ?? false,
  };

  if (input.id) {
    // Le nom d'avant sert à rattraper les quartiers qui ne tiennent à la
    // commune que par son libellé : après le renommage il serait introuvable.
    const { data: avant } = await supabase
      .from("communes")
      .select("nom")
      .eq("id", input.id)
      .maybeSingle();
    const ancienNom = (avant?.nom as string | undefined)?.trim() ?? "";

    // `ordre` n'est écrit que s'il est explicitement fourni : sinon une
    // simple édition remettait la commune en tête de liste (ordre = 0).
    const payload =
      input.ordre !== undefined ? { ...data, ordre: input.ordre } : data;
    const { error } = await supabase.from("communes").update(payload).eq("id", input.id);
    if (error) {
      return {
        ok: false,
        error:
          error.code === "23505"
            ? "Ce slug est déjà utilisé par une autre commune."
            : error.message,
      };
    }

    if (ancienNom && ancienNom.toLowerCase() !== nom.toLowerCase()) {
      // `quartiers.commune` est un libellé texte NOT NULL qui double le
      // rattachement par identifiant. Sans propagation, renommer une commune
      // laissait ses quartiers afficher l'ancien nom.
      const parIdentifiant = await supabase
        .from("quartiers")
        .update({ commune: nom })
        .eq("commune_id", input.id);

      // Ceux qui n'ont pas de `commune_id` ne tiennent QUE par ce libellé : le
      // renommage les faisait basculer dans « Quartiers sans commune » et les
      // retirait du groupement du dropdown Localisation. On les adopte par
      // identifiant, pour ne plus jamais dépendre du texte.
      //
      // Le rapprochement se fait en mémoire, et non par `.ilike()` : dans un
      // motif LIKE, `%` et `_` sont des jokers — et PostgREST traduit en plus
      // `*` en `%`, ce qu'aucun échappement côté SQL ne rattrape. Une commune
      // dont le nom porte l'un de ces caractères aurait donc adopté des
      // quartiers étrangers, en écrasant leur libellé et en leur posant son
      // identifiant. La table est de l'ordre de la centaine de lignes.
      const orphelins = await supabase
        .from("quartiers")
        .select("id, commune")
        .is("commune_id", null);
      const aAdopter = ((orphelins.data ?? []) as Array<{ id: string; commune: string | null }>)
        .filter((q) => (q.commune ?? "").trim().toLowerCase() === ancienNom.toLowerCase())
        .map((q) => q.id);
      const parLibelle = aAdopter.length
        ? await supabase
            .from("quartiers")
            .update({ commune: nom, commune_id: input.id })
            .in("id", aAdopter)
        : { error: null };

      // Le renommage de la commune est déjà commité : taire l'échec de la
      // propagation rendrait invisible le bug même qu'elle corrige — des
      // quartiers restés sur l'ancien libellé, sous un `{ ok: true }`.
      const echec = parIdentifiant.error ?? orphelins.error ?? parLibelle.error;
      if (echec) {
        revaliderVitrine();
        return {
          ok: false,
          error:
            "Commune enregistrée, mais le libellé de ses quartiers n'a pas pu " +
            `être mis à jour : ${echec.message}`,
        };
      }
    }
    revaliderVitrine();
    return { ok: true, data: { id: input.id } };
  } else {
    const { data: existing } = await supabase.from("communes").select("ordre").order("ordre", { ascending: false }).limit(1);
    const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;

    const { data: created, error } = await supabase.from("communes").insert({ ...data, ordre: input.ordre ?? nextOrdre }).select("id").single();
    if (error || !created) {
      return {
        ok: false,
        error:
          error?.code === "23505"
            ? "Ce slug est déjà utilisé par une autre commune."
            : error?.message ?? "Erreur.",
      };
    }
    revaliderVitrine();
    return { ok: true, data: { id: created.id } };
  }
}

export async function deleteCommune(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("communes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
  return { ok: true, data: undefined };
}

export async function toggleCommuneActive(id: string, isActive: boolean): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("communes").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
  return { ok: true, data: undefined };
}

export async function upsertCommuneAndRedirect(input: CommuneFormData) {
  const result = await upsertCommune(input);
  // /admin/communes rebondit sur /admin/geographie en perdant la query
  // string : le flash n'arrivait jamais. Le type distingue création et
  // modification, sinon une commune tout juste créée s'annonçait
  // « Modification enregistrée ».
  if (result.ok) redirect(`/admin/geographie?flash=${input.id ? "saved" : "created"}`);
  return result;
}
