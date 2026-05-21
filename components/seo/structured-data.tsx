/**
 * Composants utilitaires pour injecter du JSON-LD schema.org dans les pages.
 * Tous sont des Server Components purs (juste un <script>) sans hydratation.
 *
 * Référence : https://developers.google.com/search/docs/appearance/structured-data
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

/**
 * Organization : informations sur l'agence (logo, adresse, contact, social).
 * À injecter UNE FOIS sur la home pour aider Google à comprendre l'entité.
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: "Agence Mirna",
    legalName: "Agence Mirna Immobilier",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/opengraph-image.png`,
    description:
      "Agence immobilière à Abidjan, Côte d'Ivoire. Vente, location meublée, gestion locative, décoration et programmes neufs dans tout le Grand Abidjan.",
    foundingDate: "2022",
    founder: {
      "@type": "Person",
      name: "Madame Barry Néné Yéro",
      jobTitle: "Directrice générale",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "1er étage de l'immeuble Fawaz, Rue Pierre Marie et Currie",
      addressLocality: "Marcory Zone 4",
      addressRegion: "Abidjan",
      addressCountry: "CI",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+225-01-43-48-31-31",
        contactType: "customer service",
        email: "info@agencemirna.com",
        areaServed: "CI",
        availableLanguage: ["French"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+225-01-00-68-61-83",
        contactType: "sales",
        areaServed: "CI",
        availableLanguage: ["French"],
      },
    ],
    sameAs: [
      "https://instagram.com/agencemirna",
      "https://facebook.com/agencemirna",
      "https://linkedin.com/company/agencemirna",
      "https://youtube.com/@agencemirna",
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Abidjan",
        "@id": "https://www.wikidata.org/wiki/Q3578",
      },
    ],
    knowsAbout: [
      "Vente immobilière",
      "Location meublée",
      "Gestion locative",
      "Décoration d'intérieur",
      "Investissement immobilier",
      "Bail commercial",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * WebSite avec SearchAction : permet à Google d'afficher la sitelink
 * search box dans les résultats. À injecter sur la home aussi.
 */
export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Agence Mirna",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/properties?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "fr-CI",
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * BreadcrumbList : fil d'Ariane pour Google (affiché dans les résultats).
 * Items dans l'ordre d'arborescence, le dernier est la page courante.
 */
export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
