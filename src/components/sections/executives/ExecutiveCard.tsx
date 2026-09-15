import Image from 'next/image';
import type { Executive } from '@/types/types';

const SOCIAL_ICON_CLASSES = 'flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-primary';

function LinkedinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8" />
      <path d="M12 16v-3a2 2 0 0 1 4 0v3" />
      <line x1="12" y1="16" x2="12" y2="11" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function ExecutiveCard({ executive }: { executive: Executive }) {
  const hasSocial =
    executive.social &&
    (executive.social.linkedin || executive.social.github || executive.social.facebook);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border">
        <Image
          src={executive.photo}
          alt={executive.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <h3 className="mt-4 font-heading font-semibold text-text-main">
        {executive.name}
      </h3>
      <p className="mt-1 text-sm text-primary">{executive.designation}</p>

      {hasSocial && (
        <div className="mt-4 flex gap-2">
          {executive.social?.linkedin && (
            <a href={executive.social.linkedin} aria-label={`${executive.name} on LinkedIn`} className={SOCIAL_ICON_CLASSES}>
              <LinkedinIcon />
            </a>
          )}
          {executive.social?.github && (
            <a href={executive.social.github} aria-label={`${executive.name} on GitHub`} className={SOCIAL_ICON_CLASSES}>
              <GithubIcon />
            </a>
          )}
          {executive.social?.facebook && (
            <a href={executive.social.facebook} aria-label={`${executive.name} on Facebook`} className={SOCIAL_ICON_CLASSES}>
              <FacebookIcon />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
