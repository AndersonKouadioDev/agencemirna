"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Section FAQ — accordion accessible avec aria-expanded + animation.
 * Layout 2 colonnes : titre + CTA WhatsApp à gauche, accordion à droite.
 *
 * Pas de dépendance HeroUI Accordion (qui exigerait un wrapper) — on
 * fait un accordion custom léger avec framer-motion pour l'expansion.
 */

const FAQS = [
  {
    q: "Quels sont vos frais d'agence pour la location ?",
    a: "Pour une location standard, nos honoraires sont de 1 mois de loyer pour le bailleur et 1 mois pour le locataire (visite, état des lieux, rédaction du bail). Pour la gestion locative complète, nous facturons 8% du loyer mensuel encaissé.",
  },
  {
    q: "Combien de temps pour vendre un bien à Abidjan ?",
    a: "Le délai moyen sur nos mandats est de 4 à 6 semaines pour les biens correctement estimés. Cocody Riviera et Plateau partent généralement plus vite. Nous publions sur 4 portails, notre réseau d'expats et nos clients investisseurs.",
  },
  {
    q: "Acceptez-vous les paiements en plusieurs fois pour la location courte durée ?",
    a: "Pour les séjours de plus de 30 jours, nous proposons un échelonnement sur 2 versements (50% à la réservation, 50% à 7 jours du séjour). Tous les moyens de paiement sont acceptés : virement, Wave, Orange Money, MTN MoMo.",
  },
  {
    q: "Êtes-vous présents en dehors d'Abidjan ?",
    a: "Notre cœur de marché est Abidjan (Cocody, Plateau, Marcory, Riviera, Bingerville). Sur demande spécifique, nous accompagnons des projets à Bouaké, Yamoussoukro et San-Pédro via notre réseau de partenaires locaux.",
  },
  {
    q: "Comment puis-je estimer la valeur de mon bien ?",
    a: "Nous proposons une estimation gratuite et sans engagement sous 24h. Envoyez-nous les photos + la fiche détaillée du bien via WhatsApp ou notre formulaire de contact, un expert vous rappelle pour valider les éléments et vous transmet une fourchette de prix argumentée.",
  },
  {
    q: "Quelles garanties pour la gestion de mon bien en mon absence ?",
    a: "Mandat de gestion détaillé, comptes rendus mensuels avec photos, virement à date fixe le 5 du mois, dépôt de garantie séquestré, assurance loyers impayés en option, intervention 24h en cas d'urgence (plomberie, électricité). Vous avez un interlocuteur unique dédié.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16">
          {/* Colonne gauche : titre + CTA */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Questions fréquentes
            </p>
            <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              On vous répond
            </h2>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              Les questions que nos clients nous posent le plus souvent.
              Votre question n'est pas listée ? Discutons-en directement.
            </p>

            {/* CTA WhatsApp */}
            <Link
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                "https://wa.me/22501434831131"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-3 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Poser une question
            </Link>
          </div>

          {/* Colonne droite : accordion */}
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {FAQS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group focus:outline-none"
                  >
                    <span
                      className={cn(
                        "font-medium text-base sm:text-lg leading-snug transition-colors",
                        isOpen
                          ? "text-secondary"
                          : "text-neutral-800 group-hover:text-primary",
                      )}
                    >
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-300",
                        isOpen && "rotate-180 text-primary",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-10 text-sm text-neutral-600 leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
