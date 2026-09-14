import { getActiveFaqs } from "@/src/actions/public";
import FaqAccordionClient from "./faq-accordion-client";
import { getSiteContact } from "@/src/lib/site-contact";

/**
 * Wrapper Server Component de l'accordéon FAQ.
 *
 * Le repli de six questions codées en dur annonçait des tarifs (« 1 mois de
 * loyer », « 8% du loyer encaissé »), une couverture géographique et des
 * modalités de paiement : des engagements commerciaux qu'aucun écran ne
 * permettait de corriger, puisqu'ils réapparaissaient précisément quand
 * l'admin dépubliait toutes les FAQ. Sans question en base on ne montre donc
 * rien — l'accordéon se masque déjà de lui-même sur une liste vide.
 */
export default async function FAQSection() {
  const faqs = await getActiveFaqs();
  const { whatsappMessageUrl } = await getSiteContact();
  return (
    <FaqAccordionClient
      faqs={faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }))}
      whatsappUrl={whatsappMessageUrl}
    />
  );
}
