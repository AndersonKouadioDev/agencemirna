import DescriptionSection from "@/components/properties/[property_id]/description-section";
import { getSiteContact } from "@/src/lib/site-contact";
import { estMeuble, estVente } from "@/src/lib/bien-nature";
import GallerySection from "@/components/properties/[property_id]/gallery-section";
import SimilarProperties from "@/components/properties/[property_id]/similar-properties";

import { getBienWithImages } from "@/src/actions/bien.actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

/**
 * La table `biens` n'a pas de types générés : le client Supabase est créé sans
 * générique `Database`, si bien que `getBienWithImages` renvoie `any`. On
 * décrit donc ici les seuls champs que cette page lit réellement, joints
 * compris, pour que les métadonnées et le JSON-LD soient vérifiés.
 */
type BienFiche = {
  id: string;
  name: string | null;
  description: string | null;
  short_description: string | null;
  address: string | null;
  ville_commune: string | null;
  pays: string | null;
  image: string | null;
  prix: number | null;
  prix_month: number | null;
  chambre: number | null;
  salle_bains: number | null;
  capacity: number | null;
  created_at: string | null;
  types_bien: { name: string | null } | null;
  services_bien: { name: string | null } | null;
  categories_bien: { name: string | null } | null;
};

/**
 * Métadonnées dynamiques par bien : essentiel SEO local immobilier.
 * Title + description + OG + canonical générés depuis les vraies données.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ property_id: string }>;
}): Promise<Metadata> {
  const { property_id } = await params;
  const bien: BienFiche | null = await getBienWithImages(property_id);

  if (!bien) {
    return {
      title: "Bien introuvable",
      robots: { index: false, follow: false },
    };
  }

  const ville = bien.ville_commune ?? "Abidjan";
  const type = bien.types_bien?.name ?? "Bien";
  const service = bien.services_bien?.name ?? "";
  // L'unité était choisie sur la seule présence de `prix_month` : un bien en
  // « Vente » n'ayant que `prix` voyait son prix de vente suffixé « FCFA/nuit »
  // dans la <meta description> et dans la carte Open Graph. On la choisit donc
  // sur le service et la catégorie, comme le fait la fiche elle-même.
  const isVente = estVente(bien);
  const isMeuble = estMeuble(bien);

  const montantVente = bien.prix
    ? `${bien.prix.toLocaleString("fr-FR")} FCFA`
    : null;
  const montantNuit = bien.prix
    ? `${bien.prix.toLocaleString("fr-FR")} FCFA/nuit`
    : null;
  const montantMois = bien.prix_month
    ? `${bien.prix_month.toLocaleString("fr-FR")} FCFA/mois`
    : null;

  let price: string | null;
  if (isVente) {
    price = montantVente;
  } else if (isMeuble && montantNuit) {
    price = montantNuit;
  } else {
    price = montantMois ?? montantNuit;
  }

  const titleParts = [type, bien.name, "à", ville].filter(Boolean);
  const title = titleParts.join(" ");

  const descParts = [
    `${type} à ${ville}`,
    bien.chambre ? `${bien.chambre} chambre${bien.chambre > 1 ? "s" : ""}` : null,
    bien.salle_bains
      ? `${bien.salle_bains} salle${bien.salle_bains > 1 ? "s" : ""} de bain`
      : null,
    bien.capacity ? `capacité ${bien.capacity} pers.` : null,
    price,
    service ? `(${service})` : null,
  ].filter(Boolean);
  const description = `${descParts.join(", ")}. Découvrez ce bien sur Agence Mirna, votre expert immobilier à Abidjan.`;

  const url = `${SITE_URL}/properties/${property_id}`;
  const coverImage = bien.image
    ? bien.image.startsWith("http")
      ? bien.image
      : `${SITE_URL}${bien.image}`
    : `${SITE_URL}/opengraph-image.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: coverImage, alt: bien.name ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
  };
}

export default async function Page(props: {
  params: Promise<{ property_id: string }>;
}) {
  const params = await props.params;
  const [bien, contact] = await Promise.all([
    getBienWithImages(params.property_id),
    getSiteContact(),
  ]);

  if (!bien) {
    notFound();
  }

  // Vue typée de la ligne pour tout ce que cette page lit elle-même. Les
  // composants enfants continuent de recevoir la valeur brute : leurs props
  // portent leur propre typage, qu'on ne veut pas contraindre d'ici.
  const fiche: BienFiche = bien;

  // JSON-LD schema.org RealEstateListing pour Google Real Estate.
  // https://developers.google.com/search/docs/appearance/structured-data
  // Permet à Google d'afficher le bien avec image, prix, localisation
  // dans les résultats enrichis.
  const url = `${SITE_URL}/properties/${params.property_id}`;
  const ville = fiche.ville_commune ?? "Abidjan";
  const coverImage = fiche.image
    ? fiche.image.startsWith("http")
      ? fiche.image
      : `${SITE_URL}${fiche.image}`
    : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: fiche.name,
    url,
    description: fiche.description ?? fiche.short_description,
    image: coverImage,
    datePosted: fiche.created_at,
    address: {
      "@type": "PostalAddress",
      addressLocality: ville,
      addressCountry: fiche.pays ?? "Côte d'Ivoire",
      streetAddress: fiche.address ?? undefined,
    },
    numberOfRooms: fiche.chambre,
    numberOfBathroomsTotal: fiche.salle_bains,
    offers: fiche.prix
      ? {
          "@type": "Offer",
          price: fiche.prix,
          priceCurrency: "XOF",
          availability: "https://schema.org/InStock",
          url,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Biens", url: "/properties" },
          { name: fiche.name ?? "Bien", url: `/properties/${params.property_id}` },
        ]}
      />
      <DescriptionSection bien={bien} contact={contact} />
      <GallerySection bien={bien} />
      <SimilarProperties currentBienId={fiche.id} />

    </>
  );
}
