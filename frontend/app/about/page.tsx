import Link from 'next/link';
import Image from 'next/image';
import { Target, Eye, FileDown, ArrowRight, Trophy } from 'lucide-react';
import { achievements } from '@/data/achievements';

const MILESTONES = [
  { year: '2020', title: 'Club Founded', description: 'NEUCC was founded by a small group of first-year CSE students passionate about competitive programming.' },
  { year: '2021', title: 'First Programming Contest', description: 'Hosted the club\'s first internal programming contest with 40 participants.' },
  { year: '2022', title: 'First ICPC Participation', description: 'Fielded the club\'s first team at the ICPC Asia Regional Preliminary round.' },
  { year: '2023', title: 'Cybersecurity Wing Launched', description: 'Introduced CTF training and launched the club\'s first cybersecurity workshop series.' },
  { year: '2024', title: 'First Hackathon', description: 'Organized the first NEUCC Hackathon, drawing participants from multiple departments.' },
  { year: '2026', title: '300+ Active Members', description: 'Crossed 300 active members and expanded to weekly workshops and biannual contests.' },
];

const ADVISORS = [
  {
    name: 'Farhana Ahmed',
    designation: 'Assistant Professor, CSE — Faculty Moderator',
    message: 'My role is simple: give students the room to experiment, fail safely, and come back stronger. NEUCC has consistently exceeded what I thought possible from a student club.',
    photo: 'https://picsum.photos/seed/neucc-advisor-01/300/300',
  },
];

export default function AboutPage() {
  const achievementSummary = achievements.slice(0, 3);

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
            To cultivate a culture of programming excellence, technical
            curiosity, and collaborative problem-solving among students of
            Netrokona University — through contests, workshops, and
            hands-on learning.
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
            To be recognized as one of the leading university computing
            clubs in the country, producing competitive programmers,
            security researchers, and innovators who represent Bangladesh
            on regional and global stages.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Our History
        </h2>
        <div className="relative mt-10 space-y-8 border-l border-border pl-8">
          {MILESTONES.map((milestone) => (
            <div key={milestone.year} className="relative">
              <span className="absolute -left-[2.35rem] flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {milestone.year}
              </span>
              <h3 className="mt-1 font-heading font-semibold text-text-main">
                {milestone.title}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {milestone.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Faculty Advisor
        </h2>
        <div className="mt-10 flex justify-center">
          {ADVISORS.map((advisor) => (
            <div
              key={advisor.name}
              className="flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border">
                <Image
                  src={advisor.photo}
                  alt={advisor.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-text-muted">{advisor.message}</p>
              <div>
                <p className="font-heading font-semibold text-text-main">{advisor.name}</p>
                <p className="text-xs text-text-muted">{advisor.designation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
              <p className="mt-2 text-xs text-text-muted">{item.organization}</p>
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
