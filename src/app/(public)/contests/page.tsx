export const metadata = { title: 'Contests', description: 'Programming contests, CTFs, and hackathons hosted by NEUCC.' };

import { prisma } from '@/lib/prisma';
import { ContestCard } from '@/components/sections/contests/ContestCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function ContestsPage() {
  const sorted = await prisma.contest.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Contests
        </h1>
        <p className="mt-3 text-text-muted">
          Programming contests, CTFs, and hackathons — past results and
          upcoming registrations.
        </p>
      </div>

      <div className="mt-12">
        {sorted.length === 0 ? <EmptyState title="No contests published yet" description="Contest schedules and results will appear here when the club publishes them." /> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{sorted.map((contest) => {
          const normalizedDate = contest.date instanceof Date ? contest.date.toISOString() : new Date(contest.date).toISOString();

          return (
            <ContestCard
              key={contest.id}
              contest={{
                ...contest,
                date: normalizedDate,
                registrationLink: contest.registrationLink,
              }}
            />
          );
        })}</div>}
      </div>
    </div>
  );
}
