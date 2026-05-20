"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import * as React from "react";

/**
 * Wrapper de section qui anime son apparition au scroll (whileInView).
 * - Fade-up subtil (30px) sur ~600ms ease-out
 * - Respecte prefers-reduced-motion (ne fait rien)
 * - Une seule fois (margin viewport négative pour déclencher avant le full reveal)
 *
 * Usage : `<MotionSection>...</MotionSection>` à la place de `<section>`.
 * Pour stagger les enfants : utiliser <MotionStaggerChild> à l'intérieur.
 */
export function MotionSection({
  children,
  className,
  as = "section",
  delay = 0,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  delay?: number;
} & React.HTMLAttributes<HTMLElement>) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as as any;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  const Comp = motion[as] as any;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/**
 * Container qui stagger ses enfants directs (avec MotionStaggerChild).
 */
const staggerVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export function MotionStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerVariants}
    >
      {children}
    </motion.div>
  );
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function MotionStaggerChild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={childVariants}>
      {children}
    </motion.div>
  );
}
