import { getActiveTestimonials } from "@/src/actions/public";
import TestimonialsCarouselClient, {
  type TestimonialItem,
} from "./testimonials-carousel-client";

/**
 * Wrapper Server Component qui fetch les témoignages actifs depuis Supabase.
 * Fallback statique avec 3 témoignages si la table est vide pour ne pas
 * casser le visuel pendant que le seed n'a pas tourné.
 */

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "fb-1",
    quote:
      "L'Agence Mirna a géré la location de mon appartement à Marcory de A à Z. Trouvaille de locataires sérieux en moins de 2 semaines, état des lieux digital, virement à date fixe. Je recommande sans hésiter.",
    author_name: "Aïcha K.",
    author_role: "Propriétaire bailleur · Marcory Zone 4",
    avatar_initials: "AK",
    rating: 5,
  },
  {
    id: "fb-2",
    quote:
      "Expat français récemment muté à Abidjan, j'avais besoin d'un studio meublé clé en main. Mirna m'a trouvé un bien à Cocody en 4 jours, visite virtuelle, contrat signé à distance. Service vraiment premium.",
    author_name: "Thomas R.",
    author_role: "Directeur Commercial · Expatrié",
    avatar_initials: "TR",
    rating: 5,
  },
  {
    id: "fb-3",
    quote:
      "J'investis dans l'immo résidentiel depuis 5 ans. Mirna est la seule agence d'Abidjan qui m'a présenté un dossier complet avec rentabilité brute, charges, comparables. Du sérieux.",
    author_name: "Yves M.",
    author_role: "Investisseur · Plateau-Abidjan",
    avatar_initials: "YM",
    rating: 5,
  },
];

export default async function TestimonialsSection() {
  const fromDb = await getActiveTestimonials();
  const testimonials = fromDb.length > 0 ? fromDb : FALLBACK_TESTIMONIALS;
  return <TestimonialsCarouselClient testimonials={testimonials} />;
}
