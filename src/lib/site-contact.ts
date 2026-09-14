import { cache } from "react";
import { createClient } from "@/src/supabase/server";

/**
 * Coordonnées de repli, utilisées tant que `site_settings` n'a pas été
 * renseigné depuis l'admin (la migration 0014 insère une ligne de démo).
 */
export const DEFAULT_SITE_CONTACT = {
  phone: "+225 01 43 483 131",
  phones: [
    "(+225) 27 21 536 231",
    "(+225) 01 43 483 131",
    "(+225) 07 03 06 42 06",
  ],
  whatsapp: "22501434831131",
  email: "info@agencemirna.com",
  facebook: "https://facebook.com/agencemirna",
  instagram: "https://instagram.com/agencemirna",
  linkedin: "https://linkedin.com/company/agencemirna",
};

export type SiteContact = {
  /** Numéro principal, tel qu'il doit être affiché. */
  phone: string;
  /** Tous les numéros à afficher (un seul dès que l'admin en a saisi un). */
  phones: string[];
  /** Chiffres uniquement, format wa.me. */
  whatsapp: string;
  whatsappUrl: string;
  telHref: string;
  email: string;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
};

/**
 * Ignore les valeurs vides et la ligne de démo « +225 00 00 00 00 00 »
 * pour ne jamais afficher un numéro factice sur la vitrine.
 */
function clean(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  if (digits && /^0+$/.test(digits.replace(/^225/, ""))) return null;
  return v;
}

export const getSiteContact = cache(async (): Promise<SiteContact> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("phone, whatsapp, email, facebook, instagram, linkedin")
    .limit(1)
    .maybeSingle();

  if (error) console.error("getSiteContact error:", error);

  const phone = clean(data?.phone);
  const whatsapp = (clean(data?.whatsapp) ?? DEFAULT_SITE_CONTACT.whatsapp).replace(/\D/g, "");
  const resolvedPhone = phone ?? DEFAULT_SITE_CONTACT.phone;

  return {
    phone: resolvedPhone,
    phones: phone ? [phone] : DEFAULT_SITE_CONTACT.phones,
    whatsapp,
    whatsappUrl: `https://wa.me/${whatsapp}`,
    telHref: `tel:${resolvedPhone.replace(/[^\d+]/g, "")}`,
    email: clean(data?.email) ?? DEFAULT_SITE_CONTACT.email,
    facebook: clean(data?.facebook) ?? DEFAULT_SITE_CONTACT.facebook,
    instagram: clean(data?.instagram) ?? DEFAULT_SITE_CONTACT.instagram,
    linkedin: clean(data?.linkedin) ?? DEFAULT_SITE_CONTACT.linkedin,
  };
});
