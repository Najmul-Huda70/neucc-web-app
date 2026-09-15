import React from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/executives', label: 'Executives' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
];

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8" />
      <path d="M12 16v-3a2 2 0 0 1 4 0v3" />
      <line x1="12" y1="16" x2="12" y2="11" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: '#', label: 'Facebook', Icon: FacebookIcon },
  { href: '#', label: 'GitHub', Icon: GithubIcon },
  { href: '#', label: 'LinkedIn', Icon: LinkedinIcon },
  { href: '#', label: 'Discord', Icon: MessageCircle },
];

const DEVELOPERS = ['Najmul Huda', 'Zuel Rana', 'Md. Samiul Islam Pias'];

function SocialLink({ href, label, Icon }: { href: string; label: string; Icon: React.ComponentType<{ size?: number }> }) {
  const linkClasses = 'flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-primary';
  return React.createElement('a', { href, 'aria-label': label, className: linkClasses }, React.createElement(Icon, { size: 18 }));
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-text-main">
              NEUCC
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Netrokona University Computer Club — building a community of
              programmers, problem-solvers, and tech enthusiasts.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <SocialLink key={social.label} href={social.href} label={social.label} Icon={social.Icon} />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-main">
              Quick Links
            </h4>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text-main">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-main">
              Contact
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              <li>neucc@netrokona.university.edu</li>
              <li>+880 1XXX-XXXXXX</li>
              <li>Netrokona University, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-text-muted sm:flex-row">
          <p>© 2026 University Computer Club. All rights reserved.</p>
          <p>Developed by {DEVELOPERS.join(', ')}</p>
        </div>
      </div>
    </footer>
  );
}
