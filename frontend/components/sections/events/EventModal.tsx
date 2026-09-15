'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, CalendarDays, MapPin, Users, Share2, Check, ExternalLink } from 'lucide-react';
import type { Event } from '@/data/types';

export function EventModal({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} — ${event.venue} on ${event.date}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed, fall through to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const registerLinkClasses = 'inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 w-full sm:h-64">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="672px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <X size={18} />
          </button>
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${
              event.status === 'Upcoming'
                ? 'bg-success text-white'
                : 'bg-text-muted text-white'
            }`}
          >
            {event.status}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {event.category}
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold text-text-main">
            {event.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {event.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {event.venue}
            </div>
            {event.status === 'Past' && event.participantCount !== undefined && (
              <div className="flex items-center gap-2">
                <Users size={16} />
                {event.participantCount} participants
              </div>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-text-muted">
            {event.description}
          </p>

          {event.agenda.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-main">
                Agenda
              </h3>
              <ul className="mt-3 space-y-2">
                {event.agenda.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-text-muted">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {event.guests.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-main">
                Guests
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {event.guests.map((guest, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-sm font-semibold text-text-main">{guest.name}</p>
                    <p className="text-xs text-text-muted">{guest.designation}</p>
                    <p className="mt-1 text-xs font-medium text-primary">{guest.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {event.status === 'Upcoming' && event.registrationLink && (
              React.createElement('a', { href: event.registrationLink, target: '_blank', rel: 'noopener noreferrer', className: registerLinkClasses }, 'Register Now', React.createElement(ExternalLink, { size: 14 }))
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text-main transition-colors hover:bg-surface"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? 'Link Copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
