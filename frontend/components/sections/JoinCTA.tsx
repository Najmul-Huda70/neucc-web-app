import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function JoinCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-8 py-14 text-center">
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Ready to Join NEUCC?
        </h2>
        <p className="max-w-xl text-sm text-white/90">
          Become part of a growing community of programmers, competitors, and
          builders. Membership is open to all students, regardless of
          experience level.
        </p>
        <Link
          href="/join-us"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
        >
          Join Us Today
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
