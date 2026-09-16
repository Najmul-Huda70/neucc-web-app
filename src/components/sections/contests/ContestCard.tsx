import { Trophy, Calendar, ExternalLink } from 'lucide-react';
import type { Contest } from '@/types/types';

const TYPE_STYLES: Record<Contest['type'], string> = {
  Programming: 'bg-primary/10 text-primary',
  CTF: 'bg-error/10 text-error',
  Hackathon: 'bg-success/10 text-success',
};

export function ContestCard({ contest }: { contest: Contest }) {
  const isUpcoming = new Date(contest.date).getTime() > Date.now();

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${TYPE_STYLES[contest.type]}`}>
            {contest.type}
          </span>
          <h3 className="mt-3 font-heading text-lg font-semibold text-text-main">
            {contest.name}
          </h3>
        </div>
        {isUpcoming && (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Upcoming
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        <Calendar size={14} />
        {new Date(contest.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>

      <p className="mt-4 text-sm text-text-muted">{contest.result}</p>

      {contest.winners.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-main">
            <Trophy size={14} className="text-primary" />
            Leaderboard
          </p>
          <ul className="space-y-1.5">
            {contest.winners.map((winner) => (
              <li key={winner.rank} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {winner.rank}
                  </span>
                  {winner.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {contest.registrationLink && (
        <a
          href={contest.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Register Now
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}
