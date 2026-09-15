"use client";

import { motion } from "framer-motion";
import AnnonceCard from "@/components/annonces/annonce-card";
import type { PublicAnnonce } from "@/src/actions/public";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function AnnoncesGrid({ annonces }: { annonces: PublicAnnonce[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {annonces.map((annonce) => (
        <motion.div key={annonce.id} variants={item} className="h-full">
          <AnnonceCard annonce={annonce} />
        </motion.div>
      ))}
    </motion.div>
  );
}
