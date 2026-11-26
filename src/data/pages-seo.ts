import type { FiltreSeo, StatsBiens } from "@/src/lib/pages-seo";
import { listeDeLieux } from "@/src/lib/pages-seo";

/**
 * Contenu des pages d'atterrissage SEO.
 *
 * Chaque page vise une recherche précise (« studio meublé Abidjan »…) avec un
 * texte utile et les biens correspondants, mis à jour automatiquement. Elles
 * servent aussi de pages d'arrivée pour Google Ads.
 *
 * Règle de rédaction : ne rien affirmer que l'agence ne puisse tenir. Les
 * prix et les quartiers viennent des biens publiés (voir src/lib/pages-seo.ts),
 * jamais d'un chiffre écrit ici.
 */

export type TexteDynamique = string | ((stats: StatsBiens) => string);

export type BlocPoints = { titre: string; texte: string };

export type SectionSeo = {
  titre: string;
  paragraphes?: TexteDynamique[];
  points?: BlocPoints[];
  /** Points numérotés (étapes) plutôt qu'en grille. */
  etapes?: boolean;
};

export type LienSeo = { libelle: string; href: string };

export type PageSeo = {
  slug: string;
  /** Titre Google, sans le suffixe « | Agence Mirna » ajouté par le layout. */
  titre: string;
  description: string;
  /** Libellé des liens internes vers cette page. */
  lienCourt: string;
  surtitre: string;
  h1: string;
  accroche: string;
  image: { src: string; alt: string };
  /** Bouton principal du bandeau ; par défaut « Voir les logements ». */
  boutonPrincipal?: LienSeo;
  /** Masque le nombre de logements et les prix du bandeau (page propriétaires). */
  masquerChiffres?: boolean;
  biens: { filtre: FiltreSeo; titre: string; max?: number; texteVide: string };
  biensSecondaires?: {
    filtre: FiltreSeo;
    titre: string;
    texte: string;
    max?: number;
  };
  catalogue: LienSeo;
  sections: SectionSeo[];
  faq: { question: string; reponse: TexteDynamique }[];
  cta: { titre: string; texte: string; bouton: LienSeo };
  /** Liens complémentaires, en plus des autres pages d'atterrissage. */
  voirAussi: LienSeo[];
};

const CATALOGUE_MEUBLE = "/properties?service=Location+meubl%C3%A9e";

const ETAPES_RESERVATION: SectionSeo = {
  titre: "Réserver en trois étapes",
  etapes: true,
  points: [
    {
      titre: "Choisissez un logement",
      texte:
        "Chaque fiche présente les photos, la vidéo quand elle existe, l'emplacement sur la carte et les tarifs.",
    },
    {
      titre: "Envoyez vos dates",
      texte:
        "Par le formulaire de la fiche ou sur WhatsApp, avec le nombre de personnes : nous vous confirmons la disponibilité et le prix.",
    },
    {
      titre: "Visitez ou réservez",
      texte:
        "Demandez une visite depuis la fiche, ou réservez à distance avec un conseiller si vous êtes encore à l'étranger.",
    },
  ],
};

const FAQ_DUREE = {
  question: "Quelle est la durée minimale de séjour ?",
  reponse:
    "Elle dépend du logement. Indiquez vos dates dans le formulaire de la fiche ou sur WhatsApp : nous vous confirmons la disponibilité et le prix exact pour votre séjour.",
};

const FAQ_VISITE = {
  question: "Peut-on visiter avant de réserver ?",
  reponse:
    "Oui. Cliquez sur « Demander une visite » depuis la fiche du logement : un conseiller vous rappelle pour fixer le rendez-vous.",
};

/** « … démarrent à 50 000 FCFA la nuit (1 000 000 FCFA le mois) ». */
function phrasePrix(stats: StatsBiens, sujet: string): string {
  if (!stats.prixNuitMin && !stats.prixMoisMin) {
    return "Le tarif exact figure sur chaque fiche.";
  }
  const morceaux = [
    stats.prixNuitMin && `${stats.prixNuitMin} la nuit`,
    stats.prixMoisMin && `${stats.prixMoisMin} le mois`,
  ].filter(Boolean);
  return `En ce moment, ${sujet} démarrent à ${morceaux.join(" ou ")} ; le tarif exact figure sur chaque fiche.`;
}

export const PAGES_SEO = {
  "location-meublee-marcory-zone-4": {
    slug: "location-meublee-marcory-zone-4",
    titre: "Location meublée à Marcory Zone 4",
    description:
      "Appartements et studios meublés à Marcory Zone 4, à la nuit ou au mois : photos, prix et visite. L'Agence Mirna a ses bureaux dans le quartier.",
    lienCourt: "Location meublée Marcory Zone 4",
    surtitre: "Marcory Zone 4 · Abidjan",
    h1: "Location meublée à Marcory Zone 4",
    accroche:
      "Des appartements et studios meublés au cœur de Zone 4, à louer à la nuit ou au mois. Nos bureaux sont dans le quartier, à quelques minutes de chaque logement.",
    image: {
      src: "/images/photos/terrasse-panoramique.webp",
      alt: "Terrasse d'un appartement meublé loué par l'Agence Mirna",
    },
    biens: {
      filtre: "meuble-marcory-zone-4",
      titre: "Nos logements meublés à Zone 4",
      texteVide:
        "Tous nos logements de Zone 4 sont loués en ce moment. Envoyez-nous vos dates : nous vous prévenons dès qu'un logement se libère.",
    },
    catalogue: { libelle: "Tous les biens de Zone 4", href: "/properties?location=Zone%204" },
    sections: [
      {
        titre: "Pourquoi séjourner à Zone 4",
        paragraphes: [
          "Zone 4 est l'un des quartiers les plus vivants d'Abidjan. Restaurants, cafés, boutiques, supermarchés et salles de sport s'y trouvent à pied ou à quelques minutes, de jour comme de soir.",
          "Le boulevard Valéry-Giscard-d'Estaing (VGE) relie le quartier au Plateau, le centre des affaires, et à l'aéroport Félix-Houphouët-Boigny. C'est pour cela que Zone 4 est prisé des voyageurs d'affaires, des expatriés et de la diaspora de passage.",
        ],
      },
      {
        titre: "À la nuit ou au mois",
        points: [
          {
            titre: "Court séjour",
            texte:
              "Quelques nuits pour un déplacement, des vacances ou une visite en famille : le tarif à la nuit est affiché sur chaque fiche.",
          },
          {
            titre: "Long séjour",
            texte:
              "À partir d'un mois, demandez le tarif mensuel : il revient souvent moins cher que le tarif à la nuit.",
          },
          {
            titre: "Prêt à vivre",
            texte:
              "Les logements sont meublés et équipés. La fiche de chaque bien détaille les pièces, les équipements et les services inclus.",
          },
        ],
      },
      ETAPES_RESERVATION,
    ],
    faq: [
      {
        question: "Combien coûte un logement meublé à Zone 4 ?",
        reponse: (s) => phrasePrix(s, "nos logements meublés de Zone 4"),
      },
      FAQ_DUREE,
      FAQ_VISITE,
      {
        question: "Où se trouve l'agence ?",
        reponse:
          "Nos bureaux sont à Marcory Zone 4 ; l'adresse complète figure sur la page Contact. Vous pouvez aussi nous écrire sur WhatsApp.",
      },
    ],
    cta: {
      titre: "Vous ne trouvez pas le bon logement ?",
      texte:
        "Dites-nous vos dates, votre budget et le nombre de personnes : nous vous proposons les logements disponibles à Zone 4.",
      bouton: { libelle: "Nous contacter", href: "/contact_us" },
    },
    voirAussi: [
      { libelle: "Notre service de location meublée", href: "/services/location-meublee" },
    ],
  },

  "studio-meuble-abidjan": {
    slug: "studio-meuble-abidjan",
    titre: "Studio meublé à louer à Abidjan",
    description:
      "Studios meublés et équipés à Abidjan, à la nuit ou au mois : photos, prix et demande de visite en ligne avec l'Agence Mirna.",
    lienCourt: "Studio meublé Abidjan",
    surtitre: "Location meublée · Abidjan",
    h1: "Studio meublé à Abidjan",
    accroche:
      "Des studios meublés et équipés, prêts à habiter, à louer à la nuit ou au mois. La bonne formule pour un séjour seul ou à deux, sans payer un grand appartement.",
    image: {
      src: "/images/photos/salon-meuble.webp",
      alt: "Salon meublé d'un logement loué par l'Agence Mirna",
    },
    biens: {
      filtre: "studios-meubles",
      titre: "Nos studios meublés",
      texteVide:
        "Nos studios sont tous loués en ce moment. Regardez nos 2 pièces ci-dessous ou envoyez-nous vos dates.",
    },
    biensSecondaires: {
      filtre: "deux-pieces-meubles",
      titre: "Un peu plus d'espace : nos 2 pièces meublés",
      texte:
        "Une chambre séparée du salon, pour travailler depuis le logement ou rester plusieurs semaines.",
    },
    catalogue: {
      libelle: "Tous les studios",
      href: "/properties?type=Studio&service=Location+meubl%C3%A9e",
    },
    sections: [
      {
        titre: "Pour qui ?",
        points: [
          {
            titre: "Voyage d'affaires",
            texte:
              "Une mission de quelques jours ou de quelques semaines, avec un vrai logement plutôt qu'une chambre d'hôtel.",
          },
          {
            titre: "Séjour seul ou à deux",
            texte:
              "Des vacances, un retour au pays ou une visite à la famille, dans un logement à vous.",
          },
          {
            titre: "Installation à Abidjan",
            texte:
              "Un pied-à-terre meublé le temps de trouver votre logement définitif, après une embauche ou une mutation.",
          },
        ],
      },
      {
        titre: "Studio ou 2 pièces ?",
        paragraphes: [
          "Le studio est la formule la plus économique pour une ou deux personnes. Si vous travaillez depuis le logement ou restez plusieurs semaines, un 2 pièces, avec une chambre séparée du salon, offre plus de confort.",
          "Dans les deux cas, comparez le tarif à la nuit et le tarif au mois : pour un long séjour, le mois revient souvent moins cher.",
        ],
      },
      {
        titre: "Ce qu'il faut vérifier avant de réserver",
        points: [
          {
            titre: "Le tarif",
            texte:
              "À la nuit ou au mois, selon la durée de votre séjour. Les deux tarifs sont indiqués sur la fiche quand ils existent.",
          },
          {
            titre: "L'emplacement",
            texte:
              "La carte de chaque fiche montre le quartier et l'accès : regardez la distance jusqu'à votre lieu de travail ou de visite.",
          },
          {
            titre: "Les équipements",
            texte:
              "La fiche détaille ce que comprend le logement. Une question précise ? Posez-la-nous sur WhatsApp avant de réserver.",
          },
        ],
      },
      ETAPES_RESERVATION,
    ],
    faq: [
      {
        question: "Combien coûte un studio meublé à Abidjan ?",
        reponse: (s) =>
          `Le prix dépend du quartier et de la durée du séjour. ${phrasePrix(s, "nos studios meublés")}`,
      },
      {
        question: "Dans quels quartiers sont vos studios ?",
        reponse: (s) =>
          s.lieux.length
            ? `Nos studios meublés sont en ce moment ${listeDeLieux(s.lieux)}. Chaque fiche montre l'emplacement exact sur la carte.`
            : "Chaque fiche montre l'emplacement exact du logement sur la carte.",
      },
      FAQ_DUREE,
      FAQ_VISITE,
    ],
    cta: {
      titre: "Un séjour à préparer ?",
      texte:
        "Envoyez-nous vos dates et votre budget : nous vous proposons les studios et 2 pièces disponibles.",
      bouton: { libelle: "Nous contacter", href: "/contact_us" },
    },
    voirAussi: [
      { libelle: "Tous nos logements meublés", href: CATALOGUE_MEUBLE },
      { libelle: "Notre service de location meublée", href: "/services/location-meublee" },
    ],
  },

  "appartement-meuble-abidjan": {
    slug: "appartement-meuble-abidjan",
    titre: "Appartement meublé à louer à Abidjan",
    description:
      "Appartements meublés à Abidjan pour un court ou un long séjour : prix à la nuit et au mois, photos, vidéo et demande de visite avec l'Agence Mirna.",
    lienCourt: "Appartement meublé Abidjan",
    surtitre: "Location meublée · Abidjan",
    h1: "Appartement meublé à Abidjan",
    accroche:
      "Des appartements meublés et équipés pour un court ou un long séjour, à louer à la nuit ou au mois, dans des quartiers recherchés d'Abidjan.",
    image: {
      src: "/images/photos/salon-canape-angle.webp",
      alt: "Salon avec canapé d'angle d'un appartement meublé de l'Agence Mirna",
    },
    biens: {
      filtre: "appartements-meubles",
      titre: "Nos appartements meublés",
      texteVide:
        "Tous nos appartements meublés sont loués en ce moment. Envoyez-nous vos dates : nous vous prévenons dès qu'un logement se libère.",
    },
    catalogue: { libelle: "Tous les logements meublés", href: CATALOGUE_MEUBLE },
    sections: [
      {
        titre: "Un appartement pour chaque séjour",
        points: [
          {
            titre: "2 pièces",
            texte:
              "Une chambre et un salon : l'idéal seul ou en couple, pour une mission ou un séjour de quelques semaines.",
          },
          {
            titre: "Grands appartements",
            texte:
              "Plusieurs chambres pour une famille, des amis ou une équipe en déplacement, avec un salon commun.",
          },
          {
            titre: "Long séjour",
            texte:
              "Au mois, le loyer revient souvent moins cher qu'à la nuit : demandez le tarif mensuel.",
          },
        ],
      },
      {
        titre: "Où se trouvent nos appartements ?",
        paragraphes: [
          (s) =>
            s.lieux.length
              ? `Nos appartements meublés sont en ce moment ${listeDeLieux(s.lieux)}. La carte de chaque fiche montre l'emplacement exact.`
              : "La carte de chaque fiche montre l'emplacement exact du logement.",
          "Marcory Zone 4, où se trouvent nos bureaux, est un quartier animé entre le Plateau et l'aéroport, apprécié des voyageurs d'affaires et des familles.",
        ],
      },
      ETAPES_RESERVATION,
    ],
    faq: [
      {
        question: "Combien coûte un appartement meublé à Abidjan ?",
        reponse: (s) =>
          `Le prix dépend du nombre de chambres, du quartier et de la durée du séjour. ${phrasePrix(s, "nos appartements meublés")}`,
      },
      {
        question: "Peut-on réserver depuis l'étranger ?",
        reponse:
          "Oui. Envoyez vos dates par le formulaire de la fiche ou sur WhatsApp : un conseiller vous répond et vous explique comment réserver à distance.",
      },
      FAQ_DUREE,
      FAQ_VISITE,
    ],
    cta: {
      titre: "Besoin d'un appartement pour vos dates ?",
      texte:
        "Dites-nous la durée du séjour, le nombre de personnes et votre budget : nous vous proposons les appartements disponibles.",
      bouton: { libelle: "Nous contacter", href: "/contact_us" },
    },
    voirAussi: [
      { libelle: "Notre service de location meublée", href: "/services/location-meublee" },
    ],
  },

  "gestion-locative-abidjan": {
    slug: "gestion-locative-abidjan",
    titre: "Gestion locative à Abidjan",
    description:
      "Confiez votre appartement, studio ou villa à l'Agence Mirna : mise en location, choix des locataires, loyers et entretien. Gestion locative à Abidjan.",
    lienCourt: "Gestion locative Abidjan",
    surtitre: "Propriétaires · Abidjan",
    h1: "Gestion locative à Abidjan",
    accroche:
      "Vous possédez un appartement, un studio ou une villa à Abidjan ? L'Agence Mirna le met en location et s'en occupe au quotidien : locataires, loyers, entretien.",
    image: {
      src: "/images/photos/gestion-locative.webp",
      alt: "Immeuble résidentiel à Abidjan",
    },
    boutonPrincipal: { libelle: "Estimer mon bien", href: "/estimation" },
    masquerChiffres: true,
    biens: {
      filtre: "location-meublee",
      titre: "Des logements que nous louons en ce moment",
      max: 6,
      texteVide:
        "Nos logements sont tous loués en ce moment. Le vôtre pourrait être le prochain.",
    },
    catalogue: { libelle: "Tous nos biens en location", href: CATALOGUE_MEUBLE },
    sections: [
      {
        titre: "Ce que nous prenons en charge",
        points: [
          {
            titre: "Mise en location",
            texte:
              "Estimation du loyer, photos, annonce sur notre site et visites avec les candidats.",
          },
          {
            titre: "Choix des locataires",
            texte:
              "Vérification des dossiers, pour louer à des personnes fiables et limiter les impayés.",
          },
          {
            titre: "Bail et état des lieux",
            texte:
              "Rédaction du bail, état des lieux à l'entrée et à la sortie du locataire.",
          },
          {
            titre: "Loyers",
            texte:
              "Encaissement des loyers, quittances et reversement au propriétaire.",
          },
          {
            titre: "Entretien",
            texte:
              "Suivi des réparations et des petits travaux avec des artisans de confiance.",
          },
          {
            titre: "Location meublée",
            texte:
              "Pour un bien meublé : location à la nuit ou au mois, accueil des voyageurs et suivi entre deux séjours.",
          },
        ],
      },
      {
        titre: "Meublé ou vide ?",
        paragraphes: [
          "Un logement meublé se loue à la nuit ou au mois à des voyageurs d'affaires, des expatriés ou la diaspora de passage : il demande plus de suivi, mais peut rapporter davantage. Un logement vide se loue à l'année, avec un locataire stable et moins de changements.",
          "Nous vous aidons à choisir la formule la plus adaptée à votre bien et à son quartier. S'il est vide, notre service Décoration et aménagement peut le meubler avant sa mise en location.",
        ],
      },
      {
        titre: "Comment ça se passe",
        etapes: true,
        points: [
          {
            titre: "Vous nous présentez votre bien",
            texte: "Sur WhatsApp, par téléphone ou avec le formulaire d'estimation.",
          },
          {
            titre: "Nous le visitons",
            texte: "Nous estimons le loyer et vous faisons une proposition de gestion chiffrée.",
          },
          {
            titre: "Nous le mettons en location",
            texte: "Photos, annonce, visites et choix du locataire.",
          },
          {
            titre: "Vous percevez vos loyers",
            texte: "Nous encaissons, nous vous reversons et nous vous tenons informé.",
          },
        ],
      },
    ],
    faq: [
      {
        question: "Combien coûte la gestion locative ?",
        reponse:
          "Nos honoraires dépendent du bien et des services choisis. Après la visite, nous vous faisons une proposition chiffrée.",
      },
      {
        question: "J'habite à l'étranger : pouvez-vous gérer mon bien ?",
        reponse:
          "Oui. Le suivi peut se faire entièrement à distance, par WhatsApp, téléphone et e-mail, et les loyers vous sont reversés selon les modalités prévues au contrat.",
      },
      {
        question: "Quels biens gérez-vous ?",
        reponse:
          "Appartements, studios, villas et duplex, meublés ou vides, à Abidjan. Nos bureaux sont à Marcory Zone 4, où se trouvent une grande partie des logements que nous louons.",
      },
      {
        question: "Mon bien est vide : pouvez-vous le meubler ?",
        reponse:
          "Oui. Notre service Décoration et aménagement peut le meubler et l'équiper avant sa mise en location meublée.",
      },
    ],
    cta: {
      titre: "Combien pourrait vous rapporter votre bien ?",
      texte:
        "Décrivez-le en quelques minutes : nous vous recontactons avec une estimation du loyer.",
      bouton: { libelle: "Estimer mon bien", href: "/estimation" },
    },
    voirAussi: [
      { libelle: "Notre service de gestion immobilière", href: "/services/gestion-immobiliere" },
      { libelle: "Décoration et aménagement", href: "/services/decoration-amenagement" },
    ],
  },
} satisfies Record<string, PageSeo>;

export type SlugPageSeo = keyof typeof PAGES_SEO;

export const LISTE_PAGES_SEO: PageSeo[] = Object.values(PAGES_SEO);
