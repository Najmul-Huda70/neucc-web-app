'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Executive } from '@/types/types';
import { ExecutiveCard } from './ExecutiveCard';

export function PastCommittees({ years }: { years: { year: string; members: Executive[] }[] }) {
  const [openYear, setOpenYear] = useState<string | null>(null);

  return (
    <div className="mt-16">
      <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
        Past Committees
      </h2>
      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        {years.map(({ year, members }) => {
          const isOpen = openYear === year;
          return (
            <div key={year} className="rounded-2xl border border-border bg-surface">
              <button
                type="button"
                onClick={() => setOpenYear(isOpen ? null : year)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-heading font-semibold text-text-main">
                  {year} Committee
                </span>
                <ChevronDown
                  size={18}
                  className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="grid grid-cols-1 gap-4 border-t border-border p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((member) => (
                    <ExecutiveCard key={member.id} executive={member} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
