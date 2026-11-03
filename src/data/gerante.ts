/**
 * Contenu éditorial du « mot de la gérante ».
 *
 * Module figé, sans « server-only » ni accès base : la section d'accueil et
 * celle de /about lisent la même source, ce qui évite que l'extrait affiché en
 * accueil finisse par diverger de la lettre complète. Aucun écran d'admin ne
 * pilote ce texte pour l'instant — il se modifie ici.
 *
 * `accroche` et `lettre` sont le texte VALIDÉ par la gérante : ne pas les
 * reformuler. Le reste (engagements, `histoire`) est de la mise en page
 * éditoriale, librement modifiable.
 *
 * Les apostrophes sont droites, comme partout ailleurs sur la vitrine ; passer
 * par ce module plutôt que par du JSX littéral évite au passage le ballet des
 * `&apos;` dans les composants.
 */

export type EngagementGerante = {
  titre: string;
  texte: string;
};

export const GERANTE = {
  nom: "Barry Néné Yéro",
  civilite: "Madame Barry Néné Yéro",
  role: "Fondatrice & Gérante",
  /** Portrait principal : photo en situation, avec son propre arrière-plan. */
  photo: "/images/equipe/nene-barry-agence.webp",
  photoAlt:
    "Madame Barry Néné Yéro, fondatrice et gérante de l'Agence Mirna, devant une résidence à Abidjan",
  depuis: "2018",

  /** Repère d'ancienneté : l'activité précède la création de l'agence. */
  histoire:
    "L'activité de location d'appartements meublés a débuté en 2018 ; l'agence immobilière a été officiellement créée en 2022.",

  /** Phrase d'accroche, reprise en titre sur la home et sur la page dédiée. */
  accroche:
    "Une expérience immobilière plus transparente, plus professionnelle et plus sereine.",

  /** Extrait affiché en page d'accueil : le second temps de la lettre. */
  extrait: [
    "Nous sommes convaincus que l'immobilier ne se résume pas à la vente, à l'achat ou à la location d'un bien. Il s'agit avant tout de comprendre les aspirations de chaque client, de sécuriser ses engagements et de l'accompagner dans des décisions qui comptent pour son avenir.",
  ],

  /** Lettre complète, affichée dans la section « mot de la gérante » de /about. */
  lettre: [
    "Depuis sa création en 2022, Mirna Immobilier s'est donné pour mission de contribuer à une expérience immobilière plus transparente, plus professionnelle et plus sereine en Côte d'Ivoire.",
    "Nous sommes convaincus que l'immobilier ne se résume pas à la vente, à l'achat ou à la location d'un bien. Il s'agit avant tout de comprendre les aspirations de chaque client, de sécuriser ses engagements et de l'accompagner dans des décisions qui comptent pour son avenir.",
  ],

  /** Les trois mots de la mission, dépliés. Habillage éditorial, pas une
   *  citation : à faire relire si le ton doit changer. */
  engagements: [
    {
      titre: "Transparence",
      texte:
        "Des informations claires sur le bien, le prix et chaque étape, dès le premier échange.",
    },
    {
      titre: "Professionnalisme",
      texte:
        "Une agence agréée par l'État de Côte d'Ivoire, de la recherche à la remise des clés.",
    },
    {
      titre: "Sérénité",
      texte:
        "Des engagements sécurisés, pour des décisions qui comptent pour votre avenir.",
    },
  ] satisfies readonly EngagementGerante[],
} as const;
