/**
 * Contenu éditorial du « mot de la gérante ».
 *
 * Module figé, sans « server-only » ni accès base : la home et la page dédiée
 * lisent la même source, ce qui évite que l'extrait affiché en accueil finisse
 * par diverger de la lettre complète. Aucun écran d'admin ne pilote ce texte
 * pour l'instant — il se modifie ici.
 *
 * Les apostrophes sont droites, comme partout ailleurs sur la vitrine ; passer
 * par ce module plutôt que par du JSX littéral évite au passage le ballet des
 * `&apos;` dans les composants.
 */

export type EngagementGerante = {
  titre: string;
  texte: string;
};

export type RepereGerante = {
  valeur: string;
  libelle: string;
};

export const GERANTE = {
  nom: "Barry Néné Yéro",
  civilite: "Madame Barry Néné Yéro",
  role: "Fondatrice & Gérante",
  /** Portrait détouré (fond transparent) : il se pose sur n'importe quel fond. */
  photo: "/images/equipe/nene-barry.webp",
  photoAlt:
    "Portrait de Madame Barry Néné Yéro, fondatrice et gérante de l'Agence Mirna",
  depuis: "2022",

  /** Phrase d'accroche, reprise en titre sur la home et en exergue sur la page. */
  accroche: "Derrière chaque clé remise, une parole tenue.",

  /** Extrait affiché en page d'accueil : les deux premiers temps de la lettre. */
  extrait: [
    "Quand j'ai fondé l'Agence Mirna en 2022, je voulais répondre à une inquiétude que j'entendais partout autour de moi : à Abidjan, confier son bien ou chercher un logement reste trop souvent une épreuve.",
    "J'ai voulu une maison qui fasse l'inverse : un mandat clair, un interlocuteur qui connaît votre dossier, et la vérité sur un bien même quand elle dessert la vente.",
  ],

  /** Lettre complète, affichée sur /mot-de-la-gerante. */
  lettre: [
    "Quand j'ai fondé l'Agence Mirna en 2022, je voulais répondre à une inquiétude que j'entendais partout autour de moi : à Abidjan, confier son bien ou chercher un logement reste trop souvent une épreuve. Des promesses tenues à moitié, des visites sans suite, des loyers encaissés sans le moindre compte rendu. J'ai voulu une maison qui fasse exactement l'inverse.",
    "Notre méthode tient en peu de choses, mais nous n'en dérogeons pas : un mandat clair, un interlocuteur qui connaît votre dossier du premier appel à la signature, des comptes rendus réguliers, et la vérité sur un bien même quand elle dessert la vente. Un client qui comprend ce qu'il signe revient, et parle de nous autour de lui. C'est tout ce que nous demandons.",
    "Agréée par l'État de Côte d'Ivoire, notre équipe vous accompagne de la recherche à la remise des clés : vente, location meublée et non meublée, gestion locative, décoration et aménagement, construction et programmes neufs. Depuis nos bureaux de Marcory Zone 4, nous couvrons tout le Grand Abidjan.",
    "Que votre projet soit une première location, un investissement locatif ou la vente d'un bien de famille, vous serez reçu avec la même attention. Poussez notre porte, appelez-nous : nous prendrons le temps de vous écouter avant de vous proposer quoi que ce soit.",
  ],

  engagements: [
    {
      titre: "Un interlocuteur unique",
      texte:
        "Votre dossier est suivi par une personne qui le connaît, du premier appel à la remise des clés.",
    },
    {
      titre: "Des honoraires annoncés",
      texte:
        "Le montant et ce qu'il couvre vous sont dits avant la visite. Aucun frais découvert en cours de route.",
    },
    {
      titre: "Des comptes rendus réguliers",
      texte:
        "Propriétaires, vous savez où en est votre bien et votre loyer sans avoir à le réclamer.",
    },
    {
      titre: "La vérité sur le bien",
      texte:
        "Nous disons aussi ce qui ne va pas. Une belle vente est une vente que personne ne regrette.",
    },
  ] satisfies readonly EngagementGerante[],

  reperes: [
    { valeur: "2022", libelle: "Création de l'agence" },
    { valeur: "Marcory Zone 4", libelle: "Nos bureaux, immeuble Fawaz" },
    { valeur: "Agrément d'État", libelle: "Côte d'Ivoire" },
    { valeur: "Grand Abidjan", libelle: "Zone couverte" },
  ] satisfies readonly RepereGerante[],
} as const;
