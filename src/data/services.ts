/**
 * Services métier de l'agence — contenu de vitrine, volontairement figé.
 *
 * À ne pas confondre avec la table `services_bien`, gérée depuis l'admin, qui
 * sert à la création d'un bien, au filtrage du catalogue et à la navigation.
 * Ces six-là sont des pages éditoriales : leur contenu ne dépend d'aucune
 * donnée d'administration, ce qui permet de les pré-générer au build.
 *
 * Module volontairement sans directive « use server » : il expose des valeurs
 * et non des actions, pour être importable de façon synchrone.
 */
export type PublicService = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  icon: string | null;
  image: string | null;
  ordre: number;
};

export const STATIC_SERVICES: PublicService[] = [
  {
    id: "vente",
    slug: "vente",
    name: "Vente de biens immobiliers",
    short_description: "Achat et vente de villas, terrains et appartements haut de gamme.",
    icon: "Key",
    image: null,
    ordre: 1,
  },
  {
    id: "location",
    slug: "location-meublee",
    name: "Location meublée",
    short_description: "Des appartements et villas meublés prêts à vivre pour de courtes ou longues durées.",
    icon: "Sofa",
    image: null,
    ordre: 2,
  },
  {
    id: "gestion",
    slug: "gestion-immobiliere",
    name: "Gestion locative",
    short_description: "Confiez-nous la gestion de votre patrimoine immobilier en toute sérénité.",
    icon: "Building",
    image: null,
    ordre: 3,
  },
  {
    id: "construction",
    slug: "construction",
    name: "Construction",
    short_description: "Réalisation de vos projets de construction de la conception à la remise des clés.",
    icon: "HardHat",
    image: null,
    ordre: 4,
  },
  {
    id: "decoration",
    slug: "decoration-amenagement",
    name: "Décoration d'intérieur",
    short_description: "Aménagement et décoration sur-mesure pour sublimer vos espaces.",
    icon: "Paintbrush",
    image: null,
    ordre: 5,
  },
  {
    id: "promotion",
    slug: "promotion-immobiliere",
    name: "Promotion immobilière",
    short_description: "Développement de projets immobiliers résidentiels et commerciaux.",
    icon: "Briefcase",
    image: null,
    ordre: 6,
  }
];

