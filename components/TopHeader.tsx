"use client";

import { ExternalLink, Mail, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
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

function LinkedinIcon({ className = "w-5 h-5" }: { className?: string }) {
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

// প্রপসগুলোকে অপশনাল (?) করে দেওয়া হয়েছে
interface TopHeaderProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function TopHeader({
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
}: TopHeaderProps) {
  return (
    <div className="w-full border-b border-[var(--btn-secondary-border)] bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            >
              <Image
                src="/image/Logo-NeU-jpg.jpg"
                alt="Logo NeU"
                width={56}
                height={72}
                priority
                className="object-cover w-full h-full"
              />
            </Link>

            <div className="flex flex-col">
              <Link
                href="/"
                className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight hover:opacity-80 transition-opacity"
              >
                Computer Club
              </Link>
              <Link
                href="https://cse.neu.ac.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors line-clamp-1"
              >
                Department of Computer Science & Engineering
              </Link>
              <Link
                href="https://neu.ac.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[11px] sm:text-xs flex items-center gap-1 font-bold text-[var(--text-important)]"
              >
                Netrokona University
                <ExternalLink
                  size={12}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Contact & Social */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-8 w-px bg-[var(--btn-secondary-border)]" />

            <Link
              href="mailto:computerclub@neu.ac.bd"
              aria-label="Email us"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] border border-[var(--btn-secondary-border)] hover:text-white hover:bg-[var(--btn-primary-bg)] transition-colors duration-200"
            >
              <Mail size={18} />
            </Link>

            <div className="flex items-center gap-1.5">
              <Link
                href="https://facebook.com/your-page"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] border border-[var(--btn-secondary-border)] hover:text-white hover:bg-[#1877F2] transition-colors duration-200"
              >
                <FacebookIcon className="w-4 h-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/your-page"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] border border-[var(--btn-secondary-border)] hover:text-white hover:bg-[#0A66C2] transition-colors duration-200"
              >
                <LinkedinIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          {setIsMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--stat-card-bg)] border border-[var(--btn-secondary-border)]"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}