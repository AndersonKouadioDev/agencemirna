import { getActiveFaqs } from "@/src/actions/public";
import FaqAccordionClient, { type FaqItem } from "./faq-accordion-client";

/**
 * Wrapper Server Component qui fetch les FAQs actives depuis Supabase.
 * Fallback statique de 6 questions si la table est vide.
 */

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: "fb-1",
    question: "Quels sont vos frais d'agence pour la location ?",
    answer:
      "Pour une location standard, nos honoraires sont de 1 mois de loyer pour le bailleur et 1 mois pour le locataire (visite, état des lieux, rédaction du bail). Pour la gestion locative complète, nous facturons 8% du loyer mensuel encaissé.",
  },
  {
    id: "fb-2",
    question: "Combien de temps pour vendre un bien à Abidjan ?",
    answer:
      "Le délai moyen sur nos mandats est de 4 à 6 semaines pour les biens correctement estimés. Cocody Riviera et Plateau partent généralement plus vite. Nous publions sur 4 portails, notre réseau d'expats et nos clients investisseurs.",
  },
  {
    id: "fb-3",
    question:
      "Acceptez-vous les paiements en plusieurs fois pour la location courte durée ?",
    answer:
      "Pour les séjours de plus de 30 jours, nous proposons un échelonnement sur 2 versements (50% à la réservation, 50% à 7 jours du séjour). Tous les moyens de paiement sont acceptés : virement, Wave, Orange Money, MTN MoMo.",
  },
  {
    id: "fb-4",
    question: "Êtes-vous présents en dehors d'Abidjan ?",
    answer:
      "Notre cœur de marché est Abidjan (Cocody, Plateau, Marcory, Riviera, Bingerville). Sur demande spécifique, nous accompagnons des projets à Bouaké, Yamoussoukro et San-Pédro via notre réseau de partenaires locaux.",
  },
  {
    id: "fb-5",
    question: "Comment puis-je estimer la valeur de mon bien ?",
    answer:
      "Nous proposons une estimation gratuite et sans engagement sous 24h. Envoyez-nous les photos et la fiche détaillée du bien via WhatsApp ou notre formulaire de contact, un expert vous rappelle pour valider les éléments et vous transmet une fourchette de prix argumentée.",
  },
  {
    id: "fb-6",
    question: "Quelles garanties pour la gestion de mon bien en mon absence ?",
    answer:
      "Mandat de gestion détaillé, comptes rendus mensuels avec photos, virement à date fixe le 5 du mois, dépôt de garantie séquestré, assurance loyers impayés en option, intervention 24h en cas d'urgence (plomberie, électricité). Vous avez un interlocuteur unique dédié.",
  },
];

export default async function FAQSection() {
  const fromDb = await getActiveFaqs();
  const faqs: FaqItem[] =
    fromDb.length > 0
      ? fromDb.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        }))
      : FALLBACK_FAQS;
  return <FaqAccordionClient faqs={faqs} />;
}
