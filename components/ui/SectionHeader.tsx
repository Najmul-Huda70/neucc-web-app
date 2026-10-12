"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type SectionHeaderProps = {
  /** Main Heading Title (e.g., "What We Do", "Executive Committee") */
  title: string;
  /** Optional Subtitle or short description */
  subtitle?: string;
  /** Alignment option: default is 'center' */
  align?: "left" | "center" | "right";
  /** Optional badge or small upper category (e.g. "EVENTS", "GALLERY") */
  badge?: string;
  /** Custom className for container overrides */
  className?: string;
  id?: string;
};

// Smooth easing curve
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE,
      staggerChildren: 0.1, // Badge, Title & Subtitle slick stagger effect
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export default function SectionHeader({
  title,
  subtitle,
  align = "center",
  badge,
  className = "",
  id,
}: SectionHeaderProps) {
  const reduceMotion = useReducedMotion();
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className={`flex flex-col max-w-2xl ${alignmentClasses[align]} ${className}`}
    >
      {/* Optional Top Badge */}
      {badge && (
        <motion.span
          variants={itemVariants}
          className="mb-2 font-mono text-xs uppercase tracking-widest text-(--text-secondary) font-semibold"
        >
          {badge}
        </motion.span>
      )}

      {/* Primary Section Title using Serif Font */}
      <motion.h2
        variants={itemVariants}
        id={id}
        className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-(--text-primary)"
      >
        {title}
      </motion.h2>

      {/* Subtitle using Muted Text */}
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="mt-4 text-base leading-relaxed text-(--text-muted)"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}