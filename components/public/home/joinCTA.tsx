"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

type JoinCTAProps = {
  /** Where the "Join the Club" button goes (your membership page or form). */
  href?: string;
};

// Edit these to match how membership really works at your club.
const WHY_JOIN = [
  {
    title: "Learn by building",
    desc: "Hands-on workshops where you ship real projects instead of only watching slides.",
  },
  {
    title: "Compete and improve",
    desc: "Programming contests and hackathons that push your problem-solving.",
  },
  {
    title: "Meet the industry",
    desc: "Seminars and sponsor-backed events with engineers and recruiters.",
  },
  {
    title: "Lead something",
    desc: "Members can stand for committees and help run the club.",
  },
];

const HOW_TO_JOIN = [
  { title: "Fill out the membership form", desc: "It takes a couple of minutes." },
  { title: "Get approved by the committee", desc: "We review applications regularly." },
  { title: "Start joining events", desc: "Register for workshops, contests, and more." },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.25 + i * 0.09 },
  }),
};

const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1, ease: EASE, delay: 0.4 } },
};

export default function JoinCTA({ href = "/membership" }: JoinCTAProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  return (
    <section
      aria-labelledby="join-title"
      className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:py-20"
    >
      <motion.div
        variants={panelVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative grid overflow-hidden bg-neutral-950 text-white lg:grid-cols-2"
      >
        {/* Soft amber glow, same accent as the hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-amber-400/15 blur-3xl"
        />

        {/* Why join */}
        <div className="relative p-8 sm:p-12 lg:p-14">
          <h2
            id="join-title"
            className="font-serif text-4xl tracking-tight sm:text-5xl"
          >
            Join the Computer Club
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-300">
            Learn by building, compete with peers, and meet people who share your interest in
            technology.
          </p>

          <ul className="mt-8 space-y-5">
            {WHY_JOIN.map((item, i) => (
              <motion.li
                key={item.title}
                custom={i}
                variants={itemVariants}
                initial={initial}
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                className="flex gap-4"
              >
                <span aria-hidden className="mt-2.5 h-0.5 w-5 shrink-0 bg-amber-400" />
                <div>
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* How to join */}
        <div className="relative border-t border-white/10 p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-400">
            How to join
          </p>

          <ol className="relative mt-8 space-y-8">
            <motion.span
              aria-hidden
              variants={lineVariants}
              initial={initial}
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="absolute bottom-4 left-[17px] top-4 w-px origin-top bg-white/15"
            />
            {HOW_TO_JOIN.map((step, i) => (
              <motion.li
                key={step.title}
                custom={i}
                variants={itemVariants}
                initial={initial}
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                className="relative flex gap-5"
              >
                <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-amber-400/50 bg-neutral-950 font-mono text-xs text-amber-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-1">
                  <h3 className="text-base font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <motion.div
            custom={WHY_JOIN.length}
            variants={itemVariants}
            initial={initial}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-10"
          >
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block"
            >
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Join the Club
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}