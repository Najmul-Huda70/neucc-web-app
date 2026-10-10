"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, Copy, Check } from "lucide-react";

type ContactSponsorshipProps = {
  email?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export default function ContactSponsorship({
  email = "sponsorship@neu.ac.bd",
}: ContactSponsorshipProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="mx-auto max-w-3xl px-4 md:px-8"
      id="contact-us"
      aria-labelledby="contact-title"
    >
      <motion.div
        variants={cardVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="rounded-3xl border border-(--border-color) bg-(--card-bg) p-8 text-center shadow-xs transition-all duration-300 hover:border-(--btn-primary-bg)"
      >
        <div className="mx-auto flex max-w-lg flex-col items-center space-y-4">
          {/* Mail Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--stat-card-bg) text-(--btn-primary-bg) border border-(--border-color)">
            <Mail size={26} aria-hidden />
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1.5">
            <h2
              id="contact-title"
              className="text-2xl font-extrabold text-(--text-primary) md:text-3xl"
            >
              Get in Touch with Us
            </h2>
            <p className="text-xs text-(--text-muted) md:text-sm leading-relaxed">
              Have questions or want to discuss custom partnership packages? Reach out directly to
              our sponsorship team.
            </p>
          </div>

          {/* Direct Email Link & Copy Button Group */}
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            {/* Email Link Button */}
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2.5 rounded-xl bg-(--btn-primary-bg) px-6 py-3 text-xs md:text-sm font-semibold text-(--btn-primary-text) shadow-md hover:opacity-90 transition active:scale-95"
            >
              <Mail size={16} />
              <span>{email}</span>
            </a>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy email address"
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--btn-secondary-border) bg-(--stat-card-bg) px-4 py-3 text-xs md:text-sm font-medium text-(--text-primary) hover:border-(--btn-primary-bg) hover:text-(--btn-primary-bg) transition active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-(--text-success)" />
                </>
              ) : (
                <>
                  <Copy size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}