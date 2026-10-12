"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/Button";

type JoinCTAProps = {
  href?: string;
};

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
  { title: "Enter your email address to receive OTP", desc: "verify your identity." },
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
      className="mx-auto w-full max-w-6xl px-6 sm:px-8 bg-(--bg-app)"
    >
      <motion.div
        variants={panelVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <Card
          padding="none"
          className="relative grid overflow-hidden rounded-sm border border-(--border-color) bg-(--card-bg) lg:grid-cols-2"
        >
          {/* Subtle Ambient Teal Accent Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-(--text-secondary)/10 blur-3xl"
          />

          {/* Left Column: Why Join */}
          <div className="relative p-6 sm:p-10 lg:p-12 space-y-6">
            <div className="space-y-3">
              <h2
                id="join-title"
                className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight"
              >
                Join the Computer Club
              </h2>
              <p className="max-w-md text-xs sm:text-sm md:text-base leading-relaxed text-(--text-muted) font-medium">
                Learn by building, compete with peers, and meet people who share your interest in
                technology.
              </p>
            </div>

            <ul className="space-y-4 pt-2">
              {WHY_JOIN.map((item, i) => (
                <motion.li
                  key={item.title}
                  custom={i}
                  variants={itemVariants}
                  initial={initial}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="flex gap-3"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-(--text-secondary)"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-(--text-primary)">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-(--text-muted)">
                      {item.desc}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Column: How to Join */}
          <div className="relative border-t border-(--border-color) p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12 bg-(--bg-subtle)/40 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-(--text-secondary)">
                How to join
              </p>

              <ol className="relative mt-6 space-y-6">
                <motion.span
                  aria-hidden
                  variants={lineVariants}
                  initial={initial}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="absolute bottom-4 left-[17px] top-4 w-px origin-top bg-(--border-color)"
                />
                {HOW_TO_JOIN.map((step, i) => (
                  <motion.li
                    key={step.title}
                    custom={i}
                    variants={itemVariants}
                    initial={initial}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    className="relative flex gap-4"
                  >
                    <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-(--border-color) bg-(--card-bg) font-mono text-xs font-bold text-(--text-primary) shadow-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="pt-1">
                      <h3 className="text-sm sm:text-base font-bold text-(--text-primary)">
                        {step.title}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm text-(--text-muted)">
                        {step.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Central Button Integration */}
            <motion.div
              custom={WHY_JOIN.length}
              variants={itemVariants}
              initial={initial}
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="mt-8 pt-4"
            >
              <Button
                href={href}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto gap-2 group cursor-pointer"
              >
                <span>Join the Club</span>
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}