"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mic, Trophy, Users, Wrench, type LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import TitleDescription from "@/components/ui/TitleDescription";
import ActionLink from "@/components/ui/ActionLink";

export type ActivityType = "WORKSHOP" | "SEMINAR" | "CONTEST" | "CONFERENCE";

type WhatWeDoProps = {
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
    linkLabel: "BROWSE WORKSHOPS",
    icon: Wrench,
  },
  {
    type: "SEMINAR",
    title: "Seminars",
    desc: "Talks by faculty, alumni, and industry experts on careers and emerging technology.",
    linkLabel: "BROWSE SEMINARS",
    icon: Mic,
  },
  {
    type: "CONTEST",
    title: "Contests",
    desc: "Programming contests and hackathons to test your skills and compete with peers.",
    linkLabel: "BROWSE CONTESTS",
    icon: Trophy,
  },
  {
    type: "CONFERENCE",
    title: "Conferences",
    desc: "Larger gatherings that bring students, researchers, and companies under one roof.",
    linkLabel: "BROWSE CONFERENCES",
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
    <section aria-labelledby="what-we-do-title" className="mx-auto w-full max-w-7xl px-6 sm:px-8">
      <motion.div
        variants={headerVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        <SectionHeader
          id="what-we-do-title"
          title="What We Do"
          subtitle="Four ways we help CSE students learn, compete, and connect."
        />
      </motion.div>

      <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-(--border-color) bg-(--border-color) sm:grid-cols-2 lg:grid-cols-4 rounded-sm shadow-xs">
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
              className="bg-(--card-bg)"
            >
              <Link
                href={`/events?type=${type}`}
                className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-(--card-hover) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--btn-primary-bg)"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-full border border-(--border-color) bg-(--bg-app) text-(--btn-primary-bg) transition-colors duration-300 group-hover:border-(--btn-primary-bg) group-hover:bg-(--btn-primary-bg) group-hover:text-white">
                    <Icon size={20} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="font-mono text-xs font-semibold tracking-widest text-(--text-muted)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <TitleDescription
                  title={title}
                  description={desc}
                  as="h3"
                  className="mt-8"
                />

                <div className="mt-auto pt-8">
                  {count > 0 && (
                    <p className="mb-4 font-mono text-xs font-semibold tracking-widest text-(--text-muted)">
                      {String(count).padStart(2, "0")} {count === 1 ? "EVENT" : "EVENTS"}
                    </p>
                  )}
                  <ActionLink label={linkLabel} />
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}