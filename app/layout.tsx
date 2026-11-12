import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_SITE_CONTACT } from "@/src/data/contact";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Roboto as FontSans } from "next/font/google";

import "./globals.css";
import { Providers } from "./provider";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { SuiviClics } from "@/components/suivi-clics";
import { SCRIPT_CONSENTEMENT_DEFAUT } from "@/src/lib/consentement";

const fontSans = FontSans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  // Base des URL relatives : chaque page déclare sa propre adresse canonique
  // (`alternates.canonical: "/services/vente"`), résolue sur ce domaine.
  metadataBase: new URL("https://www.agencemirna.com"),
  title: {
    default: "AGENCE MIRNA | Expert Immobilier à Abidjan",
    // Court : Google tronque vers 60 caractères, et l'ancien suffixe
    // (« AGENCE MIRNA - Votre Partenaire Immobilier en Côte d'Ivoire ») portait
    // les titres de page au-delà de 100.
    template: "%s | Agence Mirna",
    absolute: "AGENCE MIRNA - Votre Expert Immobilier à Abidjan, Côte d'Ivoire",
  },
  description:
    "AGENCE MIRNA, leader de l'immobilier à Abidjan. Spécialistes en vente, location et gestion de biens premium en Côte d'Ivoire. Expertise locale, service personnalisé.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  referrer: "origin-when-cross-origin",
  keywords: [
    "Immobilier Abidjan",
    "Agence immobilière Côte d'Ivoire",
    "Vente appartement Abidjan",
    "Location maison Cocody",
    "Investissement immobilier Côte d'Ivoire",
    "Biens de luxe Abidjan",
    "Estimation immobilière Abidjan",
    "Gestion locative Côte d'Ivoire",
    "Programmes neufs Abidjan",
    "Terrain à vendre Abidjan",
    "Location bureaux Plateau",
    "Immobilier commercial Abidjan",
    "Résidences haut standing Cocody",
    "Appartements meublés Marcory",
    "Villas avec piscine Abidjan",
    "Immobilier Riviera",
    "Loft Plateau",
    "Studio étudiant Abidjan",
    "Achat maison Bingerville",
    "Location meublée Abidjan",
    "Immobilier professionnel Côte d'Ivoire",
    "AGENCE MIRNA",
    "Expert immobilier Abidjan",
    "Agence immobilière de confiance",
  ],
  authors: [{ name: "AGENCE MIRNA", url: "https://www.agencemirna.com" }],
  creator: "AGENCE MIRNA",
  publisher: "LUNION-LAB",
  // Pas d'`alternates` ici : posée dans le layout racine, l'adresse canonique
  // était héritée par toutes les pages, qui se déclaraient ainsi doublons de
  // l'accueil. Chaque page porte désormais la sienne. Le hreflang « en-US »
  // pointait vers /en, une page qui n'existe pas (404).
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://www.agencemirna.com",
    siteName: "AGENCE MIRNA",
    title: "AGENCE MIRNA - Expert Immobilier à Abidjan, Côte d'Ivoire",
    description:
      "Découvrez les meilleures offres immobilières à Abidjan avec AGENCE MIRNA. Vente, location et gestion de biens d'exception en Côte d'Ivoire.",
    images: [
      {
        url: "https://www.agencemirna.com/og-image.png",
        width: 630,
        height: 630,
        alt: "AGENCE MIRNA - Votre partenaire immobilier en Côte d'Ivoire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AgenceMirna",
    creator: "@AgenceMirna",
    title: "AGENCE MIRNA - Expert Immobilier à Abidjan",
    description:
      "Votre partenaire de confiance pour l'immobilier à Abidjan. Découvrez nos offres exclusives !",
    images: ["https://www.agencemirna.com/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Immobilier",
  verification: {
    google:
      "google-site-verification=fFyjcvBvLd5IQC3thbjB7iTjZ9vdurwAWMCIyH_O-UE",
    yandex: "42c2b5a41dd6bade",
    other: {
      bing: "0C95FF49E95D55275C93B0A21CA0A039",
    },
  },
  other: {
    "fb:app_id": "1075289994232342",
    // `metadata` est un export STATIQUE : le brancher sur `getSiteContact()`
    // imposerait un `generateMetadata()` async et rendrait dynamique TOUTE
    // l'application, pages /services pré-générées comprises. On se contente
    // donc du repli partagé, au lieu de recopier deux littéraux qui se
    // périmeraient séparément. Suivre `site_settings` ici reste un arbitrage.
    "og:phone_number": DEFAULT_SITE_CONTACT.phone,
    "og:email": DEFAULT_SITE_CONTACT.email,
    "og:latitude": "5.284599",
    "og:longitude": "-3.974556",
    "og:street-address":
      "Marcory Zone 4, Rue du 7 décembre | Abidjan Côte d'Ivoire",
    "og:locality": "Abidjan",
    "og:region": "Côte d'Ivoire",
    "og:postal-code": "22 BP 1022 Abidjan 22",
    "og:country-name": "Côte d'Ivoire",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF5EE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {/* Consentement par défaut (Consent Mode v2), avant GTM et GA4. */}
        <Script id="consentement-defaut" strategy="beforeInteractive">
          {SCRIPT_CONSENTEMENT_DEFAUT}
        </Script>
        <GoogleTagManager gtmId="GTM-W2PS7KNF" />
        {/* GA4 est chargé ici et nulle part ailleurs : le conteneur GTM ne
            doit pas recevoir de balise GA4, sous peine de compter chaque
            visite deux fois. */}
        <GoogleAnalytics gaId="G-C5RY1GRYG1" />
        <SuiviClics />

        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
