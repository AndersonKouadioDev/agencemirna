/**
 * Communes et quartiers d'Abidjan (Côte d'Ivoire).
 * Utilisé pour peupler le dropdown de localisation dans la recherche.
 *
 * Structure : commune principale → quartiers populaires
 * Le `value` est utilisé comme query (?q=) pour le filtrage `includes()`.
 */

export type AbidjanLocation = {
  /** Valeur utilisée comme query param (?q=...) : matche address/ville/quartier en includes() */
  value: string;
  /** Libellé affiché dans le dropdown */
  label: string;
  /** Groupe pour le sectioning du dropdown */
  group: string;
};

export const ABIDJAN_LOCATIONS: AbidjanLocation[] = [
  // ─── Cocody ────────────────────────────────────────────────────
  { value: "Cocody", label: "Cocody (toute la commune)", group: "Cocody" },
  { value: "Riviera", label: "Riviera", group: "Cocody" },
  { value: "II Plateaux", label: "II Plateaux", group: "Cocody" },
  { value: "Angré", label: "Angré", group: "Cocody" },
  { value: "Danga", label: "Danga", group: "Cocody" },
  { value: "Vallons", label: "Vallons", group: "Cocody" },
  { value: "M'Pouto", label: "M'Pouto", group: "Cocody" },
  { value: "Faya", label: "Faya", group: "Cocody" },
  { value: "Bingerville", label: "Bingerville", group: "Cocody" },

  // ─── Plateau ───────────────────────────────────────────────────
  { value: "Plateau", label: "Plateau (toute la commune)", group: "Plateau" },
  { value: "Plateau CBD", label: "CBD / Centre des affaires", group: "Plateau" },
  { value: "Indénié", label: "Indénié", group: "Plateau" },

  // ─── Marcory ───────────────────────────────────────────────────
  { value: "Marcory", label: "Marcory (toute la commune)", group: "Marcory" },
  { value: "Marcory Zone 4", label: "Zone 4", group: "Marcory" },
  { value: "Marcory Résidentiel", label: "Résidentiel", group: "Marcory" },
  { value: "Anoumabo", label: "Anoumabo", group: "Marcory" },
  { value: "Biétry", label: "Biétry", group: "Marcory" },

  // ─── Treichville ───────────────────────────────────────────────
  { value: "Treichville", label: "Treichville (toute la commune)", group: "Treichville" },
  { value: "Treichville Zone 3", label: "Zone 3", group: "Treichville" },
  { value: "Avenue 21", label: "Avenue 21", group: "Treichville" },

  // ─── Port-Bouët ────────────────────────────────────────────────
  { value: "Port-Bouët", label: "Port-Bouët", group: "Port-Bouët" },
  { value: "Vridi", label: "Vridi", group: "Port-Bouët" },

  // ─── Yopougon ──────────────────────────────────────────────────
  { value: "Yopougon", label: "Yopougon", group: "Yopougon" },
  { value: "Selmer", label: "Selmer", group: "Yopougon" },
  { value: "Niangon", label: "Niangon", group: "Yopougon" },

  // ─── Abobo ─────────────────────────────────────────────────────
  { value: "Abobo", label: "Abobo", group: "Abobo" },

  // ─── Adjamé ────────────────────────────────────────────────────
  { value: "Adjamé", label: "Adjamé", group: "Adjamé" },
  { value: "Williamsville", label: "Williamsville", group: "Adjamé" },

  // ─── Attécoubé ─────────────────────────────────────────────────
  { value: "Attécoubé", label: "Attécoubé", group: "Attécoubé" },

  // ─── Koumassi ──────────────────────────────────────────────────
  { value: "Koumassi", label: "Koumassi", group: "Koumassi" },
];

/**
 * Liste des types de bien : pour les dropdowns de recherche rapide
 * (le filtre /properties charge dynamiquement les vrais types depuis la DB).
 */
export const BIEN_TYPES: Array<{ value: string; label: string }> = [
  { value: "", label: "Tous les types" },
  { value: "Appartement", label: "Appartement" },
  { value: "Studio", label: "Studio" },
  { value: "Villa", label: "Villa" },
  { value: "Duplex", label: "Duplex" },
  { value: "Maison", label: "Maison" },
  { value: "Terrain", label: "Terrain" },
];

/**
 * Liste des services : matchera via includes() sur le nom DB.
 */
export const BIEN_SERVICES: Array<{ value: string; label: string }> = [
  { value: "", label: "Tous les services" },
  { value: "location", label: "Location" },
  { value: "vente", label: "Vente" },
  { value: "meublée", label: "Location meublée" },
  { value: "gestion", label: "Gestion immobilière" },
];
