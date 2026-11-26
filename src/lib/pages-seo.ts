import type { BienPublicRow } from "@/src/actions/bien.actions";
import { estMeuble, estVente } from "@/src/lib/bien-nature";
import { montantUtile, prixSurDemande } from "@/src/lib/bien-prix";
import { formatNumber } from "@/utils/formatNumber";

/**
 * Sélection des biens et chiffres affichés sur les pages d'atterrissage SEO
 * (/location-meublee-marcory-zone-4, /studio-meuble-abidjan…).
 *
 * Tout est calculé sur les biens publiés : un prix « à partir de » ou une
 * liste de quartiers écrits en dur seraient faux au premier bien ajouté ou
 * retiré depuis l'admin.
 */

export type FiltreSeo =
  /** Location meublée dans le quartier Zone 4 (Marcory). */
  | "meuble-marcory-zone-4"
  /** Location meublée, type « Studio ». */
  | "studios-meubles"
  /** Location meublée, appartement à une seule chambre (2 pièces). */
  | "deux-pieces-meubles"
  /** Location meublée, appartements et duplex (les studios ont leur page). */
  | "appartements-meubles"
  /** Toute la location meublée. */
  | "location-meublee";

export type StatsBiens = {
  nombre: number;
  /** Plus petit tarif à la nuit publié, déjà formaté (« 50 000 FCFA »). */
  prixNuitMin: string | null;
  /** Plus petit tarif au mois publié, déjà formaté. */
  prixMoisMin: string | null;
  /** Quartiers ou communes des biens, du plus fourni au moins fourni. */
  lieux: { nom: string; nombre: number }[];
};

const norm = (v: string | null | undefined) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

const enLocationMeublee = (b: BienPublicRow) => estMeuble(b) && !estVente(b);
const typeDe = (b: BienPublicRow) => norm(b.types_bien?.name);

function estZone4(b: BienPublicRow): boolean {
  if (norm(b.quartiers?.name) === "zone 4") return true;
  // Repli pour un bien dont le quartier n'est pas renseigné en admin.
  return !b.quartiers && /zone ?4/.test(norm(`${b.ville_commune} ${b.address}`));
}

const FILTRES: Record<FiltreSeo, (b: BienPublicRow) => boolean> = {
  "meuble-marcory-zone-4": (b) => enLocationMeublee(b) && estZone4(b),
  "studios-meubles": (b) => enLocationMeublee(b) && typeDe(b) === "studio",
  "deux-pieces-meubles": (b) =>
    enLocationMeublee(b) && typeDe(b) === "appartement" && b.chambre === 1,
  "appartements-meubles": (b) =>
    enLocationMeublee(b) && ["appartement", "duplex"].includes(typeDe(b)),
  "location-meublee": enLocationMeublee,
};

export function filtrerBiens(
  biens: BienPublicRow[],
  filtre: FiltreSeo,
  options: { exclure?: Set<string>; max?: number } = {},
): BienPublicRow[] {
  const retenus = biens.filter(
    (b) => FILTRES[filtre](b) && !options.exclure?.has(b.id),
  );
  return options.max ? retenus.slice(0, options.max) : retenus;
}

/** « Marcory Zone 4 », « Cocody Angré », « Plateau »… ou `null`. */
export function lieuDuBien(b: BienPublicRow): string | null {
  const commune = b.communes?.nom?.trim();
  const quartier = b.quartiers?.name?.trim();
  if (commune && quartier) return `${commune} ${quartier}`;
  return commune || quartier || null;
}

function minimum(valeurs: (number | null)[]): string | null {
  const nombres = valeurs.filter((v): v is number => v != null);
  return nombres.length ? `${formatNumber(Math.min(...nombres))} FCFA` : null;
}

export function statsBiens(biens: BienPublicRow[]): StatsBiens {
  // Un bien « prix sur demande » ne doit pas fixer le « à partir de ».
  const avecPrix = biens.filter((b) => !prixSurDemande(b));
  const compte = new Map<string, number>();
  for (const b of biens) {
    const lieu = lieuDuBien(b);
    if (lieu) compte.set(lieu, (compte.get(lieu) ?? 0) + 1);
  }
  return {
    nombre: biens.length,
    prixNuitMin: minimum(avecPrix.map((b) => montantUtile(b.prix))),
    prixMoisMin: minimum(avecPrix.map((b) => montantUtile(b.prix_month))),
    lieux: [...compte]
      .map(([nom, nombre]) => ({ nom, nombre }))
      .sort((a, b) => b.nombre - a.nombre),
  };
}

/** « à Marcory Zone 4 », « à Marcory Zone 4 et au Plateau »… */
export function listeDeLieux(lieux: StatsBiens["lieux"]): string {
  const noms = lieux.map((l) => l.nom);
  const avecPreposition = noms.map((n) =>
    /^plateau$/i.test(n) ? "au Plateau" : `à ${n}`,
  );
  if (avecPreposition.length <= 1) return avecPreposition[0] ?? "";
  return `${avecPreposition.slice(0, -1).join(", ")} et ${avecPreposition.at(-1)}`;
}
