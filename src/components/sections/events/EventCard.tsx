'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Check, MapPin, Share2 } from 'lucide-react';
import { useState } from 'react';
import type { Event } from '@/types/types';

const EVENT_IMAGES: Record<Event['category'], string> = {
  WORKSHOP: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
  SEMINAR: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85',
  COMPETITION: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85',
  MEETUP: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85',
};

export function EventCard({
  event,
  onClick,
  detailsHref,
}: {
  event: Event;
  onClick?: () => void;
  detailsHref?: string;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleShare = async () => {
    const shareUrl = detailsHref
      ? new URL(detailsHref, window.location.origin).toString()
      : window.location.href;

    try {
      let copied = false;

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (!copied) throw new Error('Copy command was rejected');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('failed');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <article className="group flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/8] overflow-hidden bg-stat-surface">
        <Image
          src={EVENT_IMAGES[event.category]}
          alt={`${event.category.toLowerCase()} event: ${event.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {event.category[0] + event.category.slice(1).toLowerCase()}
          </span>
          <span className="rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-text-muted">
            {event.status[0] + event.status.slice(1).toLowerCase()}
          </span>
        </div>
        <h3 className="mt-4 min-h-5 font-heading text-lg font-bold leading-7 text-text-main">
          {event.title}
        </h3>
        <div className="mt-2 flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-sm text-text-muted">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays size={16} className="shrink-0" aria-hidden="true" />
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <span aria-hidden="true" className="text-border">|</span>
          <div className="flex min-w-0 items-center gap-2">
            <MapPin size={16} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-text-muted">
          {event.description}
        </p>

        <div className="mt-auto flex items-center gap-4 pt-6">
          {detailsHref ? (
            <Link
              href={detailsHref}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              View details
            </Link>
          ) : (
            <button
              type="button"
              onClick={onClick}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              View details
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-main"
          >
            {copyStatus === 'copied' ? <Check size={16} /> : <Share2 size={16} />}
            {copyStatus === 'copied' ? 'Link Copied!' : copyStatus === 'failed' ? 'Copy failed' : 'Share'}
          </button>
        </div>
      </div>
    </article>
  );
}
