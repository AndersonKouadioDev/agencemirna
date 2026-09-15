import {
  Award,
  Building2,
  CalendarDays,
  Clock,
  Gift,
  Handshake,
  Home,
  Key,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  Percent,
  Phone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Pictogrammes proposés pour une information du bandeau.
 *
 * La base ne stocke qu'une CLÉ, jamais un nom de composant ni un bout de SVG.
 * Trois raisons :
 *   • le jeu d'icônes peut changer de bibliothèque sans toucher aux données ;
 *   • une clé inconnue — icône retirée d'une version à l'autre, faute de
 *     frappe dans un import SQL — retombe sur un pictogramme neutre au lieu de
 *     faire tomber le bandeau, qui est monté dans le layout donc présent sur
 *     TOUTES les pages ;
 *   • rien de ce que l'admin saisit n'atteint le rendu autrement que comme du
 *     texte : aucun SVG arbitraire ne peut être injecté ici.
 *
 * Les clés sont en français, comme les colonnes de ce projet, et sont un
 * contrat avec la base : les renommer demande une migration.
 */
export type CleIcone = (typeof ICONES_BANDEAU)[number]["cle"];

export const ICONES_BANDEAU = [
  { cle: "megaphone", libelle: "Annonce", Icone: Megaphone },
  { cle: "etincelles", libelle: "Nouveauté", Icone: Sparkles },
  { cle: "telephone", libelle: "Téléphone", Icone: Phone },
  { cle: "email", libelle: "E-mail", Icone: Mail },
  { cle: "journal", libelle: "Actualité", Icone: Newspaper },
  { cle: "video", libelle: "Vidéo", Icone: PlayCircle },
  { cle: "maison", libelle: "Bien", Icone: Home },
  { cle: "immeuble", libelle: "Immeuble", Icone: Building2 },
  { cle: "cle", libelle: "Location", Icone: Key },
  { cle: "poignee-de-main", libelle: "Accompagnement", Icone: Handshake },
  { cle: "pourcentage", libelle: "Promotion", Icone: Percent },
  { cle: "cadeau", libelle: "Offre", Icone: Gift },
  { cle: "tendance", libelle: "Investissement", Icone: TrendingUp },
  { cle: "recompense", libelle: "Distinction", Icone: Award },
  { cle: "bouclier", libelle: "Garantie", Icone: ShieldCheck },
  { cle: "lieu", libelle: "Localisation", Icone: MapPin },
  { cle: "calendrier", libelle: "Événement", Icone: CalendarDays },
  { cle: "horloge", libelle: "Horaires", Icone: Clock },
] as const satisfies ReadonlyArray<{
  cle: string;
  libelle: string;
  Icone: LucideIcon;
}>;

/** Employé quand la clé enregistrée ne correspond à rien de connu. */
export const ICONE_PAR_DEFAUT = Megaphone;

export function iconeBandeau(cle: string | null | undefined): LucideIcon {
  return ICONES_BANDEAU.find((i) => i.cle === cle)?.Icone ?? ICONE_PAR_DEFAUT;
}

/** `true` si la clé fait partie du jeu proposé. Contrôle de saisie admin. */
export function cleIconeValide(cle: string | null | undefined): boolean {
  return ICONES_BANDEAU.some((i) => i.cle === cle);
}
