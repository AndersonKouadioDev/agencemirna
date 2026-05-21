"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

/**
 * Accordion FAQ client. Reçoit la liste depuis le wrapper server (FAQSection).
 * Accessible : aria-expanded, aria-controls, ESC pour fermer.
 */
export default function FaqAccordionClient({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = React.useState<string | null>(
    faqs[0]?.id ?? null,
  );

  if (faqs.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Questions fréquentes
            </p>
            <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              On vous répond
            </h2>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              Les questions que nos clients nous posent le plus souvent.
              Votre question n&apos;est pas listée ? Discutons-en directement.
            </p>

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

          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {faqs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
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
                      {item.question}
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
                        id={`faq-panel-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-10 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                          {item.answer}
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
