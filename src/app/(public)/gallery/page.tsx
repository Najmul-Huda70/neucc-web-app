'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Video } from 'lucide-react';
import { galleryItems } from '@/data/gallery';
import { Lightbox } from '@/components/sections/gallery/Lightbox';

export default function GalleryPage() {
  const [eventFilter, setEventFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const events = useMemo(
    () => Array.from(new Set(galleryItems.map((item) => item.event))).sort(),
    [],
  );
  const years = useMemo(
    () => Array.from(new Set(galleryItems.map((item) => item.year))).sort((a, b) => Number(b) - Number(a)),
    [],
  );

  const filtered = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchesEvent = eventFilter === 'All' || item.event === eventFilter;
      const matchesYear = yearFilter === 'All' || item.year === yearFilter;
      return matchesEvent && matchesYear;
    });
  }, [eventFilter, yearFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Gallery
        </h1>
        <p className="mt-3 text-text-muted">
          Photos and highlights from NEUCC events over the years.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All Events</option>
          {events.map((event) => (
            <option key={event} value={event}>{event}</option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-text-muted">
          No media matches your filters.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              {item.type === 'video' && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  <Video size={12} />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs font-medium text-white">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeIndex !== null && (
        <Lightbox
          items={filtered}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}
