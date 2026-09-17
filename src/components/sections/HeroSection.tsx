import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            <Sparkles size={14} className="text-primary" />
            Netrokona University Computer Club
          </span>
          <h1 className="mt-7 max-w-3xl font-heading text-5xl font-bold leading-[0.98] text-text-main sm:text-6xl lg:text-7xl">
            Build what <span className="text-primary">moves</span> you.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-text-muted sm:text-lg">
            A student-led space for sharper code, bolder ideas, and the people
            who make learning feel like a team sport.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/join-us"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Join the club
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-text-main transition-colors hover:bg-surface"
            >
              <CalendarDays size={16} />
              Explore events
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5 text-sm text-text-muted">
            <span><strong className="font-heading text-xl text-text-main">20+</strong> leadership roles</span>
            <span><strong className="font-heading text-xl text-text-main">10</strong> live events</span>
            <span><strong className="font-heading text-xl text-text-main">20</strong> gallery stories</span>
          </div>
        </div>

        <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-border bg-background">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85"
            alt="Students collaborating around a table"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-6 pt-24 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Learn together</p>
            <p className="mt-2 max-w-xs font-heading text-2xl font-bold">The next great project starts with a room full of curious people.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
