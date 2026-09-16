export const metadata = { title: 'Announcements', description: 'Latest notices, results, and event updates from NEUCC.' };

import { Pin, Trophy, Bell, CalendarClock } from 'lucide-react';
import { announcements } from '@/data/announcements';
import type { AnnouncementCategory } from '@/types/types';

const CATEGORY_STYLES: Record<AnnouncementCategory, string> = {
  Result: 'bg-success/10 text-success',
  Notice: 'bg-primary/10 text-primary',
  'Event Update': 'bg-error/10 text-error',
};

const CATEGORY_ICONS: Record<AnnouncementCategory, typeof Trophy> = {
  Result: Trophy,
  Notice: Bell,
  'Event Update': CalendarClock,
};

export default function AnnouncementsPage() {
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Announcements
        </h1>
        <p className="mt-3 text-text-muted">
          Notices, results, and event updates from NEUCC.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {sorted.map((item) => {
          const Icon = CATEGORY_ICONS[item.category];
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-6 ${
                item.pinned
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    <Pin size={12} />
                    Pinned
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_STYLES[item.category]}`}>
                  <Icon size={12} />
                  {item.category}
                </span>
                <span className="ml-auto text-xs text-text-muted">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h3 className="mt-3 font-heading text-lg font-semibold text-text-main">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{item.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
