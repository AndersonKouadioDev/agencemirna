/**
 * Tri des demandes envoyées par des robots.
 *
 * Trois niveaux de certitude :
 *   - « ignorer » : un robot à coup sûr (champ piège rempli, formulaire envoyé
 *     en moins de deux secondes). On répond « succès » sans rien enregistrer
 *     ni envoyer d'e-mail, pour ne pas apprendre au robot qu'il a été repéré.
 *   - « rejeter » : une demande très probablement fausse (texte tiré au
 *     hasard, nom sans voyelles…). Elle est enregistrée au statut « Rejeté »,
 *     sans e-mail : en cas d'erreur, l'agence la retrouve dans le filtre
 *     « Rejetés » de /admin/leads.
 *   - « accepter » : le reste.
 *
 * Module pur, sans accès réseau ni base : `createLead` l'appelle côté serveur.
 */

/** Nom du champ invisible que seuls les robots remplissent. */
export const NOM_CHAMP_PIEGE = "site_internet";

/** En dessous, aucun humain n'a pu remplir le formulaire. */
const DUREE_MIN_MS = 2000;

/** Données envoyées par les formulaires en plus de la demande elle-même. */
export type ControleAntiRobot = {
  /** Valeur du champ piège : doit rester vide. */
  piege?: string | null;
  /** Temps passé entre l'affichage du formulaire et son envoi, mesuré par le navigateur. */
  duree_ms?: number | null;
};

export type DemandeAControler = {
  source: string;
  full_name?: string | null;
  email?: string | null;
  message?: string | null;
  anti_robot?: ControleAntiRobot | null;
};

export type Verdict =
  | { action: "accepter" }
  | { action: "ignorer"; motif: string }
  | { action: "rejeter"; motif: string };

/**
 * Un seul « mot » de lettres, sans espace, où majuscules et minuscules
 * alternent sans logique : « ILJcQMHpUGLcanQxQKQN », « kQSDTsuZypncVFIIZgTueLz ».
 * Un vrai mot n'a au plus qu'une majuscule interne (« McDonald »).
 */
export function ressembleATexteAleatoire(texte: string | null | undefined): boolean {
  const t = texte?.trim() ?? "";
  if (t.length < 10 || !/^[A-Za-z]+$/.test(t)) return false;
  const passagesEnMajuscule = t.match(/[a-z][A-Z]/g)?.length ?? 0;
  return passagesEnMajuscule >= 3;
}

/**
 * Au moins quatre consonnes d'affilée (« Sdrnm », « Czcejrbm », « Hnqlsa »).
 * Le « y » compte comme voyelle et les lettres accentuées aussi.
 */
function motImprononcable(mot: string): boolean {
  return /[bcdfghjklmnpqrstvwxz]{4,}/i.test(mot);
}

/**
 * Un nom dont TOUS les mots (deux au moins) sont imprononçables :
 * « Sdrnm Czcejrbm », « Cqytlnp Opgclw ». Un seul mot ne suffit pas, de vrais
 * noms en contiennent (« Schmitt », « Hirschfeld »).
 */
export function ressembleANomAleatoire(nom: string | null | undefined): boolean {
  const mots = (nom ?? "").trim().split(/\s+/).filter((m) => m.length >= 4);
  return mots.length >= 2 && mots.every(motImprononcable);
}

/**
 * Adresse Gmail truffée de points : « xokuc.er.ad.ar.a2.4@gmail.com ». Gmail
 * ignore les points, les robots s'en servent pour fabriquer des milliers
 * d'adresses à partir d'une seule. Personne n'en met trois ou plus.
 */
export function ressembleAGmailFabrique(email: string | null | undefined): boolean {
  const m = (email ?? "").trim().toLowerCase().match(/^([^@]+)@(gmail|googlemail)\.com$/);
  if (!m) return false;
  return (m[1].match(/\./g)?.length ?? 0) >= 3;
}

const CYRILLIQUE = /[Ѐ-ӿ]/;
const LIEN = /https?:\/\/|www\./gi;

export function evaluerDemande(demande: DemandeAControler): Verdict {
  const controle = demande.anti_robot ?? null;

  // 1. Pièges : certitude, on ignore.
  if (controle?.piege && controle.piege.trim() !== "") {
    return { action: "ignorer", motif: "champ piège rempli" };
  }
  const duree = controle?.duree_ms;
  if (typeof duree === "number" && Number.isFinite(duree) && duree < DUREE_MIN_MS) {
    return { action: "ignorer", motif: `envoyé en ${Math.max(0, Math.round(duree))} ms` };
  }

  // 2. Indices : on garde la trace, au statut « Rejeté ».
  if (typeof duree !== "number" || !Number.isFinite(duree)) {
    // Les formulaires du site envoient toujours cette mesure ; son absence
    // signale un appel fabriqué hors du site.
    return { action: "rejeter", motif: "envoyé hors des formulaires du site" };
  }
  if (ressembleATexteAleatoire(demande.message)) {
    return { action: "rejeter", motif: "message tiré au hasard" };
  }
  if (ressembleATexteAleatoire(demande.full_name) || ressembleANomAleatoire(demande.full_name)) {
    return { action: "rejeter", motif: "nom tiré au hasard" };
  }
  if (ressembleAGmailFabrique(demande.email)) {
    return { action: "rejeter", motif: "adresse Gmail fabriquée" };
  }
  const message = demande.message ?? "";
  if (CYRILLIQUE.test(message) || CYRILLIQUE.test(demande.full_name ?? "")) {
    return { action: "rejeter", motif: "texte en alphabet cyrillique" };
  }
  if ((message.match(LIEN)?.length ?? 0) >= 3) {
    return { action: "rejeter", motif: "message rempli de liens" };
  }

  return { action: "accepter" };
}
