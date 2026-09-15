'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/executives', label: 'Executives' },
  { href: '/contests', label: 'Contests' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/join-us', label: 'Join Us' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-lg font-bold text-text-main"
          onClick={() => setIsOpen(false)}
        >
          NEUCC
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-main lg:hidden"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border px-3 pt-3 sm:hidden">
              <span className="text-sm text-text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
