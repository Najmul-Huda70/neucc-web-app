"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Mic, Trophy, Users, Wrench, type LucideIcon } from "lucide-react";

// Matches the EventType values in schema.prisma (ELECTION and OTHER are not shown here).
export type ActivityType = "WORKSHOP" | "SEMINAR" | "CONTEST" | "CONFERENCE";

type WhatWeDoProps = {
  /** Number of public events per type, e.g. { WORKSHOP: 8, CONTEST: 5 } */
  counts?: Partial<Record<ActivityType, number>>;
};

type Activity = {
  type: ActivityType;
  title: string;
  desc: string;
  linkLabel: string;
  icon: LucideIcon;
};

const ACTIVITIES: Activity[] = [
  {
    type: "WORKSHOP",
    title: "Workshops",
    desc: "Hands-on sessions where you build real projects and learn tools used in industry.",
    linkLabel: "Browse workshops",
    icon: Wrench,
  },
  {
    type: "SEMINAR",
    title: "Seminars",
    desc: "Talks by faculty, alumni, and industry experts on careers and emerging technology.",
    linkLabel: "Browse seminars",
    icon: Mic,
  },
  {
    type: "CONTEST",
    title: "Contests",
    desc: "Programming contests and hackathons to test your skills and compete with peers.",
    linkLabel: "Browse contests",
    icon: Trophy,
  },
  {
    type: "CONFERENCE",
    title: "Conferences",
    desc: "Larger gatherings that bring students, researchers, and companies under one roof.",
    linkLabel: "Browse conferences",
    icon: Users,
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.1 },
  }),
};

export default function WhatWeDo({ counts = {} }: WhatWeDoProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  return (
    <section
      aria-labelledby="what-we-do-title"
      className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:py-28"
    >
      <motion.div
        variants={headerVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2
          id="what-we-do-title"
          className="font-serif text-4xl tracking-tight text-(--text-primary) sm:text-5xl"
        >
          What We Do
        </h2>
        <p className="mt-4 text-base leading-relaxed text-(--text-secondary)">
          Four ways we help CSE students learn, compete, and connect.
        </p>
      </motion.div>

      {/* Hairline grid: gap-px over a border-colored background draws the dividers */}
      <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-(--border-color) bg-(--border-color) sm:grid-cols-2 lg:grid-cols-4">
        {ACTIVITIES.map(({ type, title, desc, linkLabel, icon: Icon }, i) => {
          const count = counts[type] ?? 0;

          return (
            <motion.li
              key={type}
              custom={i}
              variants={itemVariants}
              initial={initial}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="bg-(--bg-app)"
            >
              <Link
                href={`/events?type=${type}`}
                className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-amber-400/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-full border border-(--border-color) text-(--text-primary) transition-colors duration-300 group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-black">
                    <Icon size={20} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-(--text-muted)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-8 font-serif text-2xl text-(--text-primary)">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-(--text-secondary)">{desc}</p>

                <div className="mt-auto pt-8">
                  {count > 0 && (
                    <p className="mb-4 font-mono text-xs tracking-widest text-(--text-muted)">
                      {String(count).padStart(2, "0")} {count === 1 ? "EVENT" : "EVENTS"}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 border-b border-amber-400 pb-1 text-xs font-medium uppercase tracking-[0.18em] text-(--text-primary)">
                    {linkLabel}
                    <ArrowRight
                      size={14}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}