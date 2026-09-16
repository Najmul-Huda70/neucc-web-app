export const metadata = { title: 'Achievements & Awards', description: "Explore NEUCC's timeline of awards, recognitions, and milestones." };

import Image from 'next/image';
import { Award, Building2 } from 'lucide-react';
import { achievements } from '@/data/achievements';

export default function AchievementsPage() {
  const sorted = [...achievements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

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

      <div className="relative mt-14 space-y-10 border-l border-border pl-8 sm:pl-10">
        {sorted.map((item) => (
          <div key={item.id} className="relative">
            <span className="absolute -left-[2.6rem] flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-white sm:-left-[3.1rem]">
              <Award size={12} />
            </span>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:p-6">
              <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 160px, 100vw"
                  className="object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <h3 className="mt-1 font-heading text-lg font-semibold text-text-main">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Building2 size={14} />
                  {item.organization}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
