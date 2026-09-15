import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <span className="rounded-full border border-border bg-background px-4 py-1 text-xs font-medium uppercase tracking-wide text-text-muted">
          Netrokona University Computer Club
        </span>
        <h1 className="font-heading text-4xl font-bold leading-tight text-text-main sm:text-5xl lg:text-6xl">
          Code. Compete. <span className="text-primary">Collaborate.</span>
        </h1>
        <p className="max-w-2xl text-base text-text-muted sm:text-lg">
          NEUCC brings together programmers, problem-solvers, and tech
          enthusiasts at Netrokona University — through contests, workshops,
          and a community built to help you grow.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/join-us"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Join Us
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-text-main transition-colors hover:bg-surface"
          >
            <CalendarDays size={16} />
            View Events
          </Link>
        </div>
      </div>
    </section>
  );
}
