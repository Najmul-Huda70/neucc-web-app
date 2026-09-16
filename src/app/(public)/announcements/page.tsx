export const metadata = { title: 'Announcements', description: 'Latest notices, results, and event updates from NEUCC.' };

import { Pin, Bell } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AnnouncementsPage() {
  const sorted = await prisma.notice.findMany({
    where: { scope: 'GENERAL' },
    orderBy: [{ isPinned: 'desc' }, { date: 'desc' }],
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

      <div className="mt-12">
        {sorted.length === 0 ? <EmptyState title="No announcements yet" description="There are no public notices at the moment. Check back here for club updates and important dates." /> : <div className="space-y-4">{sorted.map((item) => {
          const Icon = Bell;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-6 ${
                item.isPinned
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    <Pin size={12} />
                    Pinned
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Icon size={12} />
                  Notice
                </span>
                <span className="ml-auto text-xs text-text-muted">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h3 className="mt-3 font-heading text-lg font-semibold text-text-main">
                {item.subject}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{item.body}</p>
            </div>
          );
        })}</div>}
      </div>
    </div>
  );
}
