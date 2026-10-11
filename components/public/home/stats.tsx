"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "framer-motion";

type StatsProps = {
  members: number;
  eventsHosted: number;
  yearsActive: number;
  sponsors: number;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.1 },
  }),
};

const barVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: { duration: 0.8, ease: EASE, delay: 0.3 + i * 0.1 },
  }),
};

// Counts up from 0 once the number scrolls into view.
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduceMotion = useReducedMotion();

  const motionValue = useMotionValue(reduceMotion ? value : 0);
  const display = useTransform(motionValue, (v) => Math.round(v).toLocaleString("en-US"));

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: 1.8, ease: EASE });
    return () => controls.stop();
  }, [inView, value, reduceMotion, motionValue]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function Stats({ members, eventsHosted, yearsActive, sponsors }: StatsProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  const items = [
    { value: members, label: "Active members" },
    { value: eventsHosted, label: "Events hosted" },
    { value: yearsActive, label: "Years active" },
    { value: sponsors, label: "Sponsors" },
  ];

  return (
    <section
      aria-label="Club statistics"
className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 lg:pb-16"    >
      {/* Hairline grid: gap-px over a border-colored background draws the dividers */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden border border-(--border-color) bg-(--border-color) lg:grid-cols-4">
        {items.map(({ value, label }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cellVariants}
            initial={initial}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-col-reverse justify-end gap-3 bg-(--bg-app) px-6 py-10 sm:px-8"
          >
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-(--text-muted)">
              {label}
            </dt>
            <dd className="m-0">
              <motion.span
                custom={i}
                variants={barVariants}
                initial={initial}
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                className="mb-5 block h-0.5 w-10 origin-left bg-amber-400"
                aria-hidden
              />
              <span className="font-serif text-5xl tracking-tight text-(--text-primary) sm:text-6xl">
                <CountUp value={value} />
              </span>
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}