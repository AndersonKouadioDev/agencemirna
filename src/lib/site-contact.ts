// Ce module lit `site_settings` via un client Supabase qui appelle `cookies()`
// de next/headers. Deux Client Components n'en importent que le TYPE
// `SiteContact` — erasé à la compilation, donc sans effet. La directive
// transforme le jour où l'un d'eux importerait une VALEUR (DEFAULT_SITE_CONTACT
// est exporté en clair) un plantage next/headers illisible en erreur de build
// explicite.
import "server-only";

import { cache } from "react";
import { createClient } from "@/src/supabase/server";
import { DEFAULT_SITE_CONTACT } from "@/src/data/contact";

/**
 * Coordonnées de repli, utilisées tant que `site_settings` n'a pas été
 * renseigné depuis l'admin (la migration 0014 insère une ligne de démo).
 */

export type SiteContact = {
  /** Numéro principal, tel qu'il doit être affiché. */
  phone: string;
  /** Tous les numéros à afficher (un seul dès que l'admin en a saisi un). */
  phones: string[];
  /** Chiffres uniquement, format wa.me. */
  whatsapp: string;
  whatsappUrl: string;
  /** Comme whatsappUrl, en conservant le message d'accroche s'il est configuré. */
  whatsappMessageUrl: string;
  telHref: string;
  email: string;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  /** Adresse postale, telle que saisie. `null` tant qu'elle ne l'est pas. */
  adresse: string | null;
  horaires: string | null;
};

/**
 * Réservé aux NUMÉROS : ignore les valeurs vides et la ligne de démo
 * « +225 00 00 00 00 00 » pour ne jamais afficher un numéro factice sur la
 * vitrine. Ne pas l'appliquer à un email ni à une URL : le test « tous les
 * chiffres à zéro » y écarterait des valeurs parfaitement valides.
 */
function numero(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  if (digits && /^0+$/.test(digits.replace(/^225/, ""))) return null;
  return v;
}

/** Champs texte (email, URLs) : on ne garde que ce qui reste après trim. */
function valeurTexte(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

export const getSiteContact = cache(async (): Promise<SiteContact> => {
  const supabase = await createClient();
  // `.order()` explicite : rien n'interdit une seconde ligne dans
  // `site_settings`, et sans tri la vitrine pourrait lire une autre ligne que
  // celle que l'admin vient d'éditer.
  // `*` plutôt qu'une liste : la migration 0026 ajoute sept colonnes, et un
  // select nominatif rejeté par PostgREST pour UNE colonne absente aurait
  // renvoyé `null` — donc le numéro de démonstration sur tout le site, sans
  // message. Avec `*`, une colonne absente est simplement `undefined`.
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) console.error("getSiteContact error:", error);

  const phone = numero(data?.phone);
  const whatsapp = (numero(data?.whatsapp) ?? DEFAULT_SITE_CONTACT.whatsapp).replace(/\D/g, "");
  const resolvedPhone = phone ?? DEFAULT_SITE_CONTACT.phone;

  // Le message d'accroche WhatsApp vient d'abord de l'admin (migration 0026).
  // À défaut, NEXT_PUBLIC_WHATSAPP_MESSAGE, qui porte une URL complète avec un
  // ?text=… dont on extrait le message — le numéro, lui, reste celui saisi.
  let texte: string | null = valeurTexte(data?.whatsapp_message);
  if (!texte) {
    try {
      const brut = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;
      if (brut) texte = new URL(brut).searchParams.get("text");
    } catch {
      texte = null;
    }
  }

  const secondaire = numero(data?.phone_secondaire);

  const whatsappUrl = `https://wa.me/${whatsapp}`;

  return {
    phone: resolvedPhone,
    phones: phone
      ? secondaire
        ? [phone, secondaire]
        : [phone]
      : DEFAULT_SITE_CONTACT.phones,
    whatsapp,
    whatsappUrl,
    whatsappMessageUrl: texte
      ? `${whatsappUrl}?text=${encodeURIComponent(texte)}`
      : whatsappUrl,
    telHref: `tel:${resolvedPhone.replace(/[^\d+]/g, "")}`,
    email: valeurTexte(data?.email) ?? DEFAULT_SITE_CONTACT.email,
    // Pas de repli sur les réseaux sociaux : c'est le seul moyen pour l'admin
    // de RETIRER une icône du footer. Avec un `?? DEFAULT_SITE_CONTACT`, le
    // test `settings?.facebook &&` du footer n'était jamais faux et le lien
    // vidé depuis /admin/parametres réapparaissait au rechargement.
    facebook: valeurTexte(data?.facebook),
    instagram: valeurTexte(data?.instagram),
    linkedin: valeurTexte(data?.linkedin),
    tiktok: valeurTexte(data?.tiktok),
    youtube: valeurTexte(data?.youtube),
    twitter: valeurTexte(data?.twitter),
    adresse: valeurTexte(data?.adresse),
    horaires: valeurTexte(data?.horaires),
  };
});
