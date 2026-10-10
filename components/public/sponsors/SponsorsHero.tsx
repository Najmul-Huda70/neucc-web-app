"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Handshake } from "lucide-react";
import { formatEventTypes, uniqueSponsors, type HeroSponsor } from "./sponsors-hero.utils";
import SponsorLogo from "./sponsorLogo";

type SponsorsHeroProps = {
  eventTypes: string[];
  sponsors: HeroSponsor[];
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const contentVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const headingVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const wordVariants: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.7, ease: EASE } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const sponsorsVariants: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.7, staggerChildren: 0.08 } },
};

const lineLeft: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const HEADING_WORDS = ["Our", "Valued", "Sponsors", "&", "Partners"];

export default function SponsorsHero({ eventTypes, sponsors }: SponsorsHeroProps) {
  const reduceMotion = useReducedMotion();
  const eventTypeText = formatEventTypes(eventTypes);
  const uniqueList = uniqueSponsors(sponsors);

  // Smooth scroll handler for anchor links
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.section
      aria-labelledby="sponsors-hero-title"
      initial={reduceMotion ? "show" : "hidden"}
      animate="show"
      className="flex min-h-[78dvh] flex-col px-6 p-4 sm:px-10"
    >
      <motion.div
        variants={contentVariants}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center"
      >
        <motion.h1
          id="sponsors-hero-title"
          aria-label="Our Valued Sponsors & Partners"
          variants={headingVariants}
          className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
        >
          {HEADING_WORDS.map((word, i) => (
            <span key={`${word}-${i}`} aria-hidden>
              <span className="inline-block overflow-hidden pb-1.5 align-bottom">
                <motion.span variants={wordVariants} className="inline-block">
                  {word}
                </motion.span>
              </span>{" "}
            </span>
          ))}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          Partner with Computer Club Dept. of CSE, NeU to sponsor {eventTypeText} that empower
          the next generation of software engineers and innovators.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#become-sponsor"
              onClick={(e) => handleScroll(e, "become-sponsor")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer"
            >
              <Handshake className="size-4" aria-hidden />
              Become a Sponsor
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/contact"
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-800 transition-colors hover:border-teal-600 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Talk to Us
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {uniqueList.length > 0 && (
        <motion.div
          variants={sponsorsVariants}
          className="mx-auto mt-12 w-full max-w-5xl"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <motion.span variants={lineLeft} className="h-px flex-1 origin-right bg-slate-200" />
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Trusted by industry leaders
            </h2>
            <motion.span variants={lineLeft} className="h-px flex-1 origin-left bg-slate-200" />
          </motion.div>

          <motion.ul
            variants={listVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            {uniqueList.map((sponsor, i) => (
              <motion.li
                key={sponsor.sponsorId}
                variants={fadeUp}
                className={`items-center gap-2.5 ${
                  i >= 12 ? "hidden xl:flex" : i >= 6 ? "hidden md:flex" : "flex"
                }`}
              >
                <SponsorLogo
                  name={sponsor.name}
                  src={sponsor.logoUrl}
                  className="size-7 rounded-md"
                  fallbackClassName="size-7 rounded-md text-[11px]"
                />
                <span className="max-w-36 truncate text-sm font-medium text-slate-700">
                  {sponsor.name}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </motion.section>
  );
}