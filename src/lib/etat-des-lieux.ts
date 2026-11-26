/**
 * États des lieux : types et modèles partagés entre le formulaire tablette,
 * l'admin et le PDF (migration 0030).
 */

export type TypeEdl = "entree" | "sortie";
export type StatutEdl = "brouillon" | "signe";
export type EtatElement = "" | "tres_bon" | "bon" | "moyen" | "mauvais" | "absent";

export const ETATS: { valeur: Exclude<EtatElement, "">; libelle: string; couleur: string; pdf: string }[] = [
  { valeur: "tres_bon", libelle: "Très bon", couleur: "bg-green-600 text-white border-green-600", pdf: "#15803d" },
  { valeur: "bon", libelle: "Bon", couleur: "bg-lime-500 text-white border-lime-500", pdf: "#65a30d" },
  { valeur: "moyen", libelle: "Moyen", couleur: "bg-amber-500 text-white border-amber-500", pdf: "#d97706" },
  { valeur: "mauvais", libelle: "Mauvais", couleur: "bg-red-600 text-white border-red-600", pdf: "#dc2626" },
  { valeur: "absent", libelle: "Absent", couleur: "bg-neutral-500 text-white border-neutral-500", pdf: "#6b7280" },
];

export const libelleEtat = (etat: EtatElement | undefined) =>
  ETATS.find((e) => e.valeur === etat)?.libelle ?? "Non renseigné";

export type ElementEdl = {
  id: string;
  nom: string;
  etat: EtatElement;
  commentaire: string;
};

export type PieceEdl = {
  id: string;
  nom: string;
  commentaire: string;
  /** Chemins dans le bucket privé `etats-des-lieux`. */
  photos: string[];
  elements: ElementEdl[];
};

export type CompteurEdl = {
  id: string;
  libelle: string;
  numero: string;
  releve: string;
  photo: string | null;
};

export type CleEdl = { id: string; libelle: string; nombre: number };

export type EtatDesLieux = {
  id: string;
  bien_id: string;
  type: TypeEdl;
  entree_id: string | null;
  date_edl: string;
  locataire_nom: string;
  locataire_email: string | null;
  locataire_telephone: string | null;
  proprietaire_nom: string | null;
  proprietaire_email: string | null;
  agent_nom: string | null;
  pieces: PieceEdl[];
  compteurs: CompteurEdl[];
  cles: CleEdl[];
  observations: string | null;
  signature_locataire: string | null;
  signature_agent: string | null;
  statut: StatutEdl;
  signe_le: string | null;
  envoye_le: string | null;
  created_at: string;
  updated_at: string;
  bien?: { id: string; name: string | null; address?: string | null; ville_commune?: string | null } | null;
};

/** Champs modifiables pendant la saisie. */
export type DonneesSaisieEdl = Pick<
  EtatDesLieux,
  | "date_edl"
  | "locataire_nom"
  | "locataire_email"
  | "locataire_telephone"
  | "proprietaire_nom"
  | "proprietaire_email"
  | "agent_nom"
  | "pieces"
  | "compteurs"
  | "cles"
  | "observations"
>;

export const nouvelId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const COMMUNS = ["Murs", "Sol", "Plafond", "Porte(s)", "Fenêtre(s)", "Prises et interrupteurs", "Éclairage"];

/** Éléments proposés par type de pièce ; l'agent ajoute ou retire sur place. */
export const MODELES_PIECES: Record<string, string[]> = {
  "Entrée": ["Porte d'entrée et serrure", ...COMMUNS.filter((e) => e !== "Porte(s)")],
  "Salon": [...COMMUNS, "Climatisation", "Rideaux", "Canapé", "Table et chaises", "Télévision"],
  "Cuisine": [
    ...COMMUNS,
    "Plan de travail",
    "Évier et robinetterie",
    "Plaques de cuisson",
    "Four / micro-ondes",
    "Réfrigérateur",
    "Hotte",
    "Placards",
    "Vaisselle et ustensiles",
  ],
  "Chambre": [...COMMUNS, "Climatisation", "Lit et literie", "Armoire / placard", "Rideaux"],
  "Salle de bain": [
    ...COMMUNS,
    "Lavabo et robinetterie",
    "Douche / baignoire",
    "WC",
    "Miroir",
    "Chauffe-eau",
    "Ventilation",
  ],
  "WC": ["Murs", "Sol", "Porte", "Cuvette et chasse d'eau", "Lave-mains", "Éclairage"],
  "Balcon / terrasse": ["Sol", "Garde-corps", "Éclairage", "Mobilier extérieur"],
  "Autre pièce": [...COMMUNS],
};

export function nouvellePiece(nom: string, modele = nom): PieceEdl {
  const elements = MODELES_PIECES[modele] ?? MODELES_PIECES["Autre pièce"];
  return {
    id: nouvelId(),
    nom,
    commentaire: "",
    photos: [],
    elements: elements.map((e) => ({ id: nouvelId(), nom: e, etat: "", commentaire: "" })),
  };
}

/** Pièces de départ, d'après le nombre de chambres du bien. */
export function piecesParDefaut(chambres: number | null | undefined): PieceEdl[] {
  const n = Math.max(1, Math.min(chambres ?? 1, 6));
  return [
    nouvellePiece("Entrée"),
    nouvellePiece("Salon"),
    nouvellePiece("Cuisine"),
    ...Array.from({ length: n }, (_, i) => nouvellePiece(n > 1 ? `Chambre ${i + 1}` : "Chambre", "Chambre")),
    nouvellePiece("Salle de bain"),
  ];
}

/** Une sortie reprend les pièces et éléments de l'entrée, états à remplir. */
export function piecesDepuisEntree(pieces: PieceEdl[]): PieceEdl[] {
  return pieces.map((p) => ({
    id: nouvelId(),
    nom: p.nom,
    commentaire: "",
    photos: [],
    elements: p.elements.map((e) => ({ id: nouvelId(), nom: e.nom, etat: "", commentaire: "" })),
  }));
}

export function compteursParDefaut(): CompteurEdl[] {
  return [
    { id: nouvelId(), libelle: "Électricité (CIE)", numero: "", releve: "", photo: null },
    { id: nouvelId(), libelle: "Eau (SODECI)", numero: "", releve: "", photo: null },
  ];
}

export function clesParDefaut(): CleEdl[] {
  return [
    { id: nouvelId(), libelle: "Porte d'entrée", nombre: 0 },
    { id: nouvelId(), libelle: "Portail / résidence", nombre: 0 },
    { id: nouvelId(), libelle: "Badge / télécommande", nombre: 0 },
  ];
}

const cle = (texte: string) =>
  texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

/**
 * État relevé à l'entrée pour chaque élément de la sortie, rapproché par nom
 * de pièce et nom d'élément (les identifiants changent d'un document à
 * l'autre).
 */
export function etatsALEntree(entree: EtatDesLieux | null): Map<string, ElementEdl> {
  const carte = new Map<string, ElementEdl>();
  for (const p of entree?.pieces ?? []) {
    for (const e of p.elements) carte.set(`${cle(p.nom)}|${cle(e.nom)}`, e);
  }
  return carte;
}

export const cleComparaison = (piece: string, element: string) => `${cle(piece)}|${cle(element)}`;

/** Ordre de gravité, pour signaler une dégradation entre entrée et sortie. */
const RANG: Record<EtatElement, number> = { "": -1, tres_bon: 0, bon: 1, moyen: 2, mauvais: 3, absent: 4 };

/**
 * Passer de « Très bon » à « Bon » relève de l'usure normale : seule une
 * baisse qui aboutit à « Moyen » ou pire est signalée comme dégradation.
 */
export function estDegrade(entree: EtatElement | undefined, sortie: EtatElement): boolean {
  if (!entree || !sortie) return false;
  return RANG[sortie] > RANG[entree] && RANG[sortie] >= RANG.moyen;
}

/** Tous les chemins de fichiers d'un état des lieux (photos et signatures). */
export function cheminsFichiers(edl: Pick<EtatDesLieux, "pieces" | "compteurs" | "signature_locataire" | "signature_agent">): string[] {
  return [
    ...edl.pieces.flatMap((p) => p.photos),
    ...edl.compteurs.map((c) => c.photo).filter((p): p is string => !!p),
    edl.signature_locataire,
    edl.signature_agent,
  ].filter((p): p is string => !!p);
}

export const libelleType = (type: TypeEdl) => (type === "entree" ? "Entrée" : "Sortie");

export const dateLongue = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
