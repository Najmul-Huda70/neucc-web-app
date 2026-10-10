"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Code,
  Crown,
  Eye,
  GraduationCap,
  Lightbulb,
  Share2,
  Store,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type Benefit = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

type WhySponsorUsProps = {
  /** Used in the social media benefit, e.g. "5,000+" */
  studentsReached?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

function getBenefits(studentsReached: string): Benefit[] {
  return [
    {
      icon: Code,
      title: "Top tech talent access",
      desc: "Competitive programmers and developers.",
    },
    {
      icon: Eye,
      title: "Prime brand visibility",
      desc: "Banners, logos, t-shirts, and contest platforms.",
    },
    {
      icon: UserPlus,
      title: "Recruitment pipeline",
      desc: "Hire pre-screened technical talent directly.",
    },
    {
      icon: Share2,
      title: "Social media reach",
      desc: `Featured posts and direct access to ${studentsReached} students.`,
    },
    {
      icon: Store,
      title: "Campus activation",
      desc: "On-ground stalls, merchandise, and live sessions.",
    },
    {
      icon: GraduationCap,
      title: "Faculty and department networking",
      desc: "Connect with university administration and faculty.",
    },
    {
      icon: Lightbulb,
      title: "Support innovation",
      desc: "Empower future engineers and the tech ecosystem.",
    },
    {
      icon: Crown,
      title: "Exclusive privileges",
      desc: "Keynote speaking, judging slots, and VIP access.",
    },
  ];
}

export default function WhySponsorUs({ studentsReached = "5,000+" }: WhySponsorUsProps) {
  const reduceMotion = useReducedMotion();
  const benefits = getBenefits(studentsReached);
  const initial = reduceMotion ? "visible" : "hidden";

  return (
    <section aria-labelledby="why-sponsor-title">
      <motion.div
        variants={headerVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2
          id="why-sponsor-title"
          className="text-3xl font-semibold tracking-tight text-(--text-primary) sm:text-4xl"
        >
          Why Sponsor Us?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-(--text-secondary)">
           unmatched brand visibility, talent recruitment, and community reach.
        </p>
      </motion.div>

      <motion.ul
        variants={gridVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
      >
        {benefits.map(({ icon: Icon, title, desc }) => (
          <motion.li key={title} variants={cardVariants}>
            <article className="group h-full rounded-2xl border border-(--border-color) bg-(--card-bg) p-4 shadow-xs sm:p-5 lg:p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-900/5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-semibold text-(--text-primary)">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--text-secondary)">{desc}</p>
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}