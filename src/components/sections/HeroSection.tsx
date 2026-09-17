import Link from 'next/link';
import { ArrowRight, Bell, CalendarDays } from 'lucide-react';

const notices = [
  'NEUCC/2026/সা-৪৭ — ২০২৬-২৭ কার্যনির্বাহী কমিটি নির্বাচনের তফসিল ঘোষণা',
  'NEUCC/2026/সা-৪৫ — Netrokona CTF — Autumn Edition ফলাফল প্রকাশ',
  'NEUCC/2026/সা-৪২ — Winter Code Sprint 2026 রেজিস্ট্রেশন শুরু',
  'NEUCC/2026/সা-৩৮ — মাসিক সাধারণ সভা আহ্বান',
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background text-text-main">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--hero-overlay-start) 0%, var(--hero-overlay-mid) 42%, var(--hero-overlay-end) 100%), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')",
            mixBlendMode: 'multiply',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top left, var(--hero-glow-one), transparent 28%), radial-gradient(circle at bottom right, var(--hero-glow-two), transparent 30%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
        <div className="max-w-[1200px]">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-badge-bg px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-badge-text shadow-[0_0_35px_rgba(37,99,235,0.12)] backdrop-blur-sm">
            Department of CSE · Netrokona University
          </div>

          <h1 className="mt-8 max-w-5xl font-heading text-5xl font-black leading-[0.9] tracking-[-0.04em] text-text-main sm:text-6xl lg:text-[7rem]">
            Netrokona University Computer Club
          </h1>

          <div className="mt-6 inline-flex rounded-full border border-border/80 bg-card/80 px-3 py-2 text-base font-medium text-text-main backdrop-blur-sm sm:text-lg">
            নেত্রকোনা বিশ্ববিদ্যালয় কম্পিউটার ক্লাব
          </div>

          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-text-muted sm:text-xl">
            Learn to code, compete nationally, build for the campus — and run a student
            body the constitutional way.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/join-us"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-button-primary-text transition-all duration-200 hover:brightness-110"
            >
              Become a member
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--button-secondary-border)] bg-transparent px-7 py-3.5 text-base font-semibold text-text-main transition-all duration-200 hover:bg-card/60"
            >
              <CalendarDays size={18} />
              Explore events
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              { label: 'Active clubs', value: '12+' },
              { label: 'Events/year', value: '18' },
              { label: 'Students reached', value: '2.4k' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-card-soft p-4 shadow-sm"
              >
                <div className="text-2xl font-black tracking-[-0.04em] text-text-main">
                  {item.value}
                </div>
                <div className="mt-1 text-sm text-text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 md:grid-cols-[auto_1fr_auto] lg:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">
            <Bell size={14} className="text-primary" />
            Notices
          </div>

          <div className="overflow-hidden">
            <div className="flex min-w-max items-center gap-8 whitespace-nowrap text-sm text-text-muted">
              {notices.map((notice, index) => (
                <span key={notice + index} className="flex items-center gap-2">
                  <span className="text-primary">NEUCC/2026/</span>
                  <span>{notice.replace('NEUCC/2026/', '')}</span>
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/announcements"
            className="hidden items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-text-main transition-colors hover:bg-card-soft md:inline-flex"
          >
            All notices
          </Link>
        </div>
      </div>
    </section>
  );
}
