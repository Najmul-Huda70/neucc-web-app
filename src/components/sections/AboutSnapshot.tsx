import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AboutSnapshot() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Who We Are
        </h2>
        <p className="mt-4 text-text-muted">
          Founded to nurture a culture of programming and innovation, NEUCC
          runs contests, workshops, and community events year-round —
          helping students turn curiosity about computing into real skill.
        </p>
        <Link
          href="/about"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Read More
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
