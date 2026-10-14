"use client";

import { Mail, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import TopHeader from "./TopHeader";
import { FacebookIcon, LinkedinIcon } from "../social-icon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/notice", label: "Notice" },
  { href: "/gallery", label: "Gallery" },
  { href: "/committee", label: "Committees" },
  { href: "/membership", label: "Membership" },
  { href: "/sponsors", label: "Sponsors" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const linkVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, delay: 0.12 + i * 0.04 },
  }),
};

function isActivePath(pathname: string, path: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Desktop sticky behavior
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [navHeight, setNavHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) setIsStuck(wrapperRef.current.getBoundingClientRect().top <= 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer = navRef.current ? new ResizeObserver(() => setNavHeight(navRef.current?.offsetHeight)) : null;
    if (navRef.current && observer) {
      observer.observe(navRef.current);
      setNavHeight(navRef.current.offsetHeight);
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  // Mobile TopHeader placeholder space
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => setHeaderHeight(headerRef.current?.offsetHeight));
    observer.observe(headerRef.current);
    setHeaderHeight(headerRef.current.offsetHeight);
    return () => observer.disconnect();
  }, []);

  // Lock body scroll on mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMobileMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const closeMobile = () => setIsMobileMenuOpen(false);

  // Link class generators
  const getLinkClass = (path: string) => {
    const isActive = isActivePath(pathname, path);
    return `relative inline-block px-4 py-1.5 font-semibold transition-colors
    after:absolute after:inset-x-4 after:-bottom-1 after:h-0.5 after:origin-left after:rounded-full
    after:bg-(--btn-primary-bg) after:transition-transform after:duration-300
    ${isActive ? "text-(--btn-primary-bg) after:scale-x-100" : "text-(--text-primary) hover:text-(--btn-primary-bg) after:scale-x-0 hover:after:scale-x-100"}`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = isActivePath(pathname, path);
    return `flex min-h-12 w-full items-center rounded-md px-3 py-3 text-base transition-colors ${
      isActive ? "font-bold text-(--btn-primary-bg)" : "font-medium text-(--text-primary) hover:bg-(--stat-card-bg)"
    }`;
  };

  return (
    <>
      {/* Top Header Placeholder */}
      <div
        className="h-(--header-h) lg:h-auto"
        style={{ "--header-h": headerHeight ? `${headerHeight}px` : "auto" } as CSSProperties}
      >
        <div
          ref={headerRef}
          className="fixed inset-x-0 top-0 z-50 border-b border-(--btn-secondary-border) bg-(--card-bg) shadow-sm lg:static lg:border-b-0 lg:bg-transparent lg:shadow-none"
        >
          <TopHeader isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </div>
      </div>

      {/* Desktop sticky navigation */}
      <div ref={wrapperRef} className="hidden lg:block" style={{ height: navHeight }}>
        <nav
          ref={navRef}
          aria-label="Main"
          className={`z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${
            isStuck
              ? "fixed inset-x-0 top-0 border-(--btn-secondary-border) bg-(--card-bg)/95 shadow-sm backdrop-blur-md"
              : "relative border-transparent bg-transparent shadow-none"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-center gap-1 py-1 text-sm">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} aria-current={isActivePath(pathname, href) ? "page" : undefined} className={getLinkClass(href)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              onClick={closeMobile}
              className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[2px] lg:hidden"
            />

            <motion.aside
              key="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 90 || info.velocity.x > 500) closeMobile();
              }}
              style={{ touchAction: "pan-y" }}
              className="fixed inset-y-0 right-0 z-[60] flex h-dvh w-[88%] max-w-sm flex-col border-l border-(--btn-secondary-border) bg-(--card-bg) shadow-2xl lg:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-(--btn-secondary-border) px-5 py-4">
                <span className="text-sm font-semibold tracking-wide text-(--text-primary)">Menu</span>
                <button
                  type="button"
                  onClick={closeMobile}
                  aria-label="Close menu"
                  className="rounded-full border border-(--btn-secondary-border) p-2 text-(--text-secondary) hover:text-(--btn-primary-bg)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                <ul className="space-y-1">
                  {NAV_LINKS.map(({ href, label }, i) => {
                    const isActive = isActivePath(pathname, href);
                    return (
                      <motion.li
                        key={href}
                        custom={i}
                        variants={linkVariants}
                        initial={reduceMotion ? "visible" : "hidden"}
                        animate="visible"
                      >
                        <Link
                          href={href}
                          onClick={closeMobile}
                          aria-current={isActive ? "page" : undefined}
                          className={getMobileLinkClass(href)}
                        >
                          <span className={isActive ? "underline decoration-2 underline-offset-8" : ""}>
                            {label}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Social Links */}
              <div className="flex items-center gap-3 border-t border-(--btn-secondary-border) px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Link
                  href="mailto:computerclub@neu.ac.bd"
                  aria-label="Email"
                  className="rounded-full border border-(--btn-secondary-border) p-2.5 text-(--text-secondary) hover:text-(--btn-primary-bg)"
                >
                  <Mail size={18} />
                </Link>
                <Link
                  href="https://facebook.com/your-page"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full border border-(--btn-secondary-border) p-2.5 text-(--text-secondary) hover:text-(--btn-primary-bg)"
                >
                  <FacebookIcon className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  href="https://linkedin.com/company/your-page"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-full border border-(--btn-secondary-border) p-2.5 text-(--text-secondary) hover:text-(--btn-primary-bg)"
                >
                  <LinkedinIcon className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}