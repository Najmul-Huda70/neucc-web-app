"use client";

import { ChevronDown, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import TopHeader from "./TopHeader";

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

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCommitteeOpen, setIsMobileCommitteeOpen] = useState(false);

  // Helper function for desktop link styles
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2.5 rounded-md inline-block font-semibold transition-colors ${
      isActive
        ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm"
        : "text-[var(--text-primary)] hover:text-[var(--btn-primary-bg)] hover:bg-[var(--stat-card-bg)]"
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `block px-3 py-2 rounded-md transition-colors ${
      isActive
        ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold"
        : "hover:bg-[var(--stat-card-bg)]"
    }`;
  };

  const isCommitteeActive = pathname.startsWith("/committee");

  return (
    <>
      {/* Separate Top Header Component (Scrolls away with page) */}
      <TopHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Desktop Sticky Navigation Menu Bar */}
      <nav className="sticky top-0 z-50 hidden lg:block w-full border-b border-[var(--btn-secondary-border)] bg-[var(--card-bg)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-1 text-sm py-1">
            <li>
              <Link href="/" className={getLinkClass("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/events" className={getLinkClass("/events")}>
                Events
              </Link>
            </li>
            <li>
              <Link href="/notice" className={getLinkClass("/notice")}>
                Notice
              </Link>
            </li>

            {/* Dropdown for Committees */}
            <li className="relative group">
              <button
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  isCommitteeActive
                    ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm"
                    : "text-[var(--text-primary)] hover:text-[var(--btn-primary-bg)] hover:bg-[var(--stat-card-bg)]"
                }`}
              >
                Committees
                <ChevronDown
                  size={16}
                  className="transition-transform group-hover:rotate-180"
                />
              </button>

              {/* Hover Dropdown Menu */}
              <div className="absolute left-0 top-full pt-1 hidden group-hover:block w-52 z-50">
                <ul className="bg-[var(--card-bg)] border border-[var(--btn-secondary-border)] rounded-lg shadow-lg py-2 flex flex-col">
                  <li>
                    <Link
                      href="/committee/executive"
                      className={`px-4 py-2 text-xs font-semibold block transition-colors ${
                        pathname === "/committee/executive"
                          ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
                          : "hover:bg-[var(--stat-card-bg)] hover:text-[var(--btn-primary-bg)]"
                      }`}
                    >
                      Executive Committee
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/committee/election"
                      className={`px-4 py-2 text-xs font-semibold block transition-colors ${
                        pathname === "/committee/election"
                          ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
                          : "hover:bg-[var(--stat-card-bg)] hover:text-[var(--btn-primary-bg)]"
                      }`}
                    >
                      Election Committee
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <Link href="/membership" className={getLinkClass("/membership")}>
                Membership
              </Link>
            </li>
            <li>
              <Link href="/sponsors" className={getLinkClass("/sponsors")}>
                Sponsors
              </Link>
            </li>
            <li>
              <Link href="/contact" className={getLinkClass("/contact")}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--btn-secondary-border)] bg-[var(--card-bg)] px-4 pt-3 pb-6 space-y-2 sticky top-[80px] z-50">
          <ul className="flex flex-col font-medium text-sm text-[var(--text-primary)] space-y-1">
            <li>
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileLinkClass("/")}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileLinkClass("/events")}
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/notice"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileLinkClass("/notice")}
              >
                Notice
              </Link>
            </li>

            {/* Mobile Accordion for Committees */}
            <li>
              <button
                onClick={() =>
                  setIsMobileCommitteeOpen(!isMobileCommitteeOpen)
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                  isCommitteeActive
                    ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold"
                    : "hover:bg-[var(--stat-card-bg)]"
                }`}
              >
                Committees
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isMobileCommitteeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isMobileCommitteeOpen && (
                <ul className="pl-4 mt-1 space-y-1 border-l-2 border-[var(--btn-secondary-border)] ml-3">
                  <li>
                    <Link
                      href="/committee/executive"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-1.5 text-xs rounded-md ${
                        pathname === "/committee/executive"
                          ? "font-bold text-[var(--btn-primary-bg)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Executive Committee
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/committee/election"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-1.5 text-xs rounded-md ${
                        pathname === "/committee/election"
                          ? "font-bold text-[var(--btn-primary-bg)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Election Committee
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/membership"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileLinkClass("/membership")}
              >
                Membership
              </Link>
            </li>
            <li>
              <Link
                href="/sponsors"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileLinkClass("/sponsors")}
              >
                Sponsors
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileLinkClass("/contact")}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Mobile Social Links */}
          <div className="pt-4 mt-2 border-t border-[var(--btn-secondary-border)] flex items-center gap-3">
            <Link
              href="mailto:computerclub@neu.ac.bd"
              className="p-2 rounded-full border border-[var(--btn-secondary-border)] text-[var(--text-secondary)]"
            >
              <Mail size={18} />
            </Link>
            <Link
              href="https://facebook.com/your-page"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-[var(--btn-secondary-border)] text-[var(--text-secondary)]"
            >
              <FacebookIcon className="w-4 h-4" />
            </Link>
            <Link
              href="https://linkedin.com/company/your-page"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-[var(--btn-secondary-border)] text-[var(--text-secondary)]"
            >
              <LinkedinIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}