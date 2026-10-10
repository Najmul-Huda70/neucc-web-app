"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, MapPin, ChevronRight, ExternalLink } from "lucide-react";

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.2.98-2.18 2.18-2.18s2.17.98 2.17 2.18v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  return (
    <footer className="w-full border-t border-(--btn-secondary-border) bg-(--card-bg) text-(--text-primary)">
      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
          
          {/* Brand Column (Matching TopHeader exact style & links) */}
          <motion.div variants={itemVariants} className="sm:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-(--border-color)"
              >
                <Image
                  src="/image/Logo-NeU-jpg.jpg"
                  alt="Logo NeU"
                  width={56}
                  height={72}
                  className="object-cover w-full h-full"
                />
              </Link>

              <div className="flex flex-col">
                <Link
                  href="/"
                  className="text-base sm:text-lg font-bold text-(--text-primary) leading-tight hover:opacity-80 transition-opacity"
                >
                  Computer Club
                </Link>
                <Link
                  href="https://cse.neu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors line-clamp-1"
                >
                  Department of Computer Science & Engineering
                </Link>
                <Link
                  href="https://neu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-[11px] sm:text-xs flex items-center gap-1 font-bold text-(--text-important)"
                >
                  Netrokona University
                  <ExternalLink
                    size={12}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-(--text-muted) leading-relaxed max-w-md">
              Empowering students through competitive programming, software engineering, research, and technical innovation.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="mailto:computerclub@neu.ac.bd"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-(--btn-secondary-border) text-(--text-secondary) hover:text-white hover:bg-(--btn-primary-bg) transition-colors duration-200"
                aria-label="Email Us"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://facebook.com/your-page"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-(--btn-secondary-border) text-(--text-secondary) hover:text-white hover:bg-[#1877F2] transition-colors duration-200"
                aria-label="Facebook Page"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/your-page"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-(--btn-secondary-border) text-(--text-secondary) hover:text-white hover:bg-[#0A66C2] transition-colors duration-200"
                aria-label="LinkedIn Page"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted) pb-1 border-b border-(--border-color) sm:border-none">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link href="/notice" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Notice Board</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Gallery</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Community */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted) pb-1 border-b border-(--border-color) sm:border-none">
              Community
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/committee" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Committees</span>
                </Link>
              </li>
              <li>
                <Link href="/membership" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Membership</span>
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Sponsors & Partners</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center gap-1 text-(--text-primary) hover:text-(--btn-primary-bg) transition-colors duration-200 group">
                  <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--btn-primary-bg) shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Campus Address & Email (Full mail address fully visible) */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted) pb-1 border-b border-(--border-color) sm:border-none">
              Campus Address
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-(--text-muted)">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-(--btn-primary-bg) shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Department of CSE, Netrokona University, Bangladesh
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-(--btn-primary-bg) shrink-0 mt-0.5" />
                <a
                  href="mailto:computerclub@neu.ac.bd"
                  className="hover:text-(--text-primary) transition underline decoration-dotted break-all leading-snug"
                >
                  computerclub@neu.ac.bd
                </a>
              </li>
            </ul>
          </motion.div>

        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-(--btn-secondary-border) bg-(--stat-card-bg) py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-(--text-muted)">
          <p className="text-center sm:text-left">
            © {currentYear} Computer Club, Netrokona University. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-(--text-primary) transition">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-(--text-primary) transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}