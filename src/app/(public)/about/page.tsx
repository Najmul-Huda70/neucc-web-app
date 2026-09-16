export const metadata = { title: 'About Us', description: "Learn about NEUCC's mission, vision, history, and faculty advisors." };

import Link from 'next/link';
import { Target, Eye, FileDown, ArrowRight, Trophy } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function AboutPage() {
  const [achievementSummary, blocks] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { date: 'desc' }, take: 3 }),
    prisma.siteContent.findMany({ where: { key: { in: ['about.mission', 'about.vision', 'about.history'] } } }),
  ]);
  const content = Object.fromEntries(blocks.map((block) => [block.key, typeof block.value === 'string' ? block.value : '']));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          About NEUCC
        </h1>
        <p className="mt-3 text-text-muted">
          Netrokona University Computer Club — our mission, our story, and
          the people behind it.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target size={20} />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-text-main">
            Our Mission
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {content['about.mission']}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Eye size={20} />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-text-main">
            Our Vision
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {content['about.vision']}
          </p>
        </div>
      </div>

      {content['about.history'] && <p className="mt-16 text-center text-sm text-text-muted">{content['about.history']}</p>}

      <div className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-text-main sm:text-3xl">
            Achievements Summary
          </h2>
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {achievementSummary.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Trophy size={18} />
              </div>
              <h3 className="mt-3 font-heading text-sm font-semibold text-text-main">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-text-muted">{item.awardingOrg ?? 'NEUCC'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
        <h2 className="font-heading text-xl font-bold text-text-main">
          Club Constitution
        </h2>
        <p className="max-w-md text-sm text-text-muted">
          Read the full governing constitution of NEUCC, covering membership
          rules, leadership structure, and club policies.
        </p>
        
        <a href="/constitution.pdf"
          download
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <FileDown size={16} />
          Download Constitution PDF
        </a>
      </div>
    </div>
  );
}
