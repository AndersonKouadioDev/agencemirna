import DescriptionSection from "@/components/properties/[property_id]/description-section";
import GallerySection from "@/components/properties/[property_id]/gallery-section";
import { getBienWithImages } from "@/src/actions/bien.actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

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
  const bien: any = await getBienWithImages(property_id);

  if (!bien) {
    return {
      title: "Bien introuvable",
      robots: { index: false, follow: false },
    };
  }

  const ville = bien.ville_commune ?? "Abidjan";
  const type = bien.types_bien?.name ?? "Bien";
  const service = bien.services_bien?.name ?? "";
  const priceMonth = bien.prix_month
    ? `${bien.prix_month.toLocaleString("fr-FR")} FCFA/mois`
    : null;
  const priceDay = bien.prix
    ? `${bien.prix.toLocaleString("fr-FR")} FCFA/nuit`
    : null;
  const price = priceMonth ?? priceDay ?? null;

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
  const bien: any = await getBienWithImages(params.property_id);

  if (!bien) {
    notFound();
  }

  // JSON-LD schema.org RealEstateListing pour Google Real Estate.
  // https://developers.google.com/search/docs/appearance/structured-data
  // Permet à Google d'afficher le bien avec image, prix, localisation
  // dans les résultats enrichis.
  const url = `${SITE_URL}/properties/${params.property_id}`;
  const ville = bien.ville_commune ?? "Abidjan";
  const coverImage = bien.image
    ? bien.image.startsWith("http")
      ? bien.image
      : `${SITE_URL}${bien.image}`
    : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: bien.name,
    url,
    description: bien.description ?? bien.short_description,
    image: coverImage,
    datePosted: bien.created_at,
    address: {
      "@type": "PostalAddress",
      addressLocality: ville,
      addressCountry: bien.pays ?? "Côte d'Ivoire",
      streetAddress: bien.address ?? undefined,
    },
    numberOfRooms: bien.chambre,
    numberOfBathroomsTotal: bien.salle_bains,
    offers: bien.prix
      ? {
          "@type": "Offer",
          price: bien.prix,
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
          { name: "Propriétés", url: "/properties" },
          { name: bien.name ?? "Bien", url: `/properties/${params.property_id}` },
        ]}
      />
      <DescriptionSection bien={bien} />
      <GallerySection bien={bien} />
    </>
  );
}
