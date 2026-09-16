export const metadata = { title: 'Achievements & Awards', description: "Explore NEUCC's timeline of awards, recognitions, and milestones." };

import { Award, Building2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AchievementsPage() {
  const sorted = await prisma.achievement.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Achievements &amp; Awards
        </h1>
        <p className="mt-3 text-text-muted">
          A timeline of NEUCC&apos;s recognitions, wins, and milestones.
        </p>
      </div>

      <div className="mt-14">
        {sorted.length === 0 ? <EmptyState title="No achievements published yet" description="Recognitions and milestones will appear here once they are added to the NEUCC records." /> : <div className="relative space-y-10 border-l border-border pl-8 sm:pl-10">{sorted.map((item) => (
          <div key={item.id} className="relative">
            <span className="absolute -left-[2.6rem] flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-white sm:-left-[3.1rem]">
              <Award size={12} />
            </span>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:p-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <h3 className="mt-1 font-heading text-lg font-semibold text-text-main">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  {item.description ?? 'No description provided.'}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Building2 size={14} />
                  {item.awardingOrg ?? 'NEUCC'}
                </div>
              </div>
            </div>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}
