import Image from 'next/image';
import { Quote } from 'lucide-react';

export function ChairpersonMessage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-surface p-8 sm:flex-row sm:p-10">
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border border-border sm:h-36 sm:w-36">
          <Image
            src="https://picsum.photos/seed/neucc-chairperson/300/300"
            alt="Department Chairperson"
            fill
            sizes="144px"
            className="object-cover"
          />
        </div>
        <div>
          <Quote className="mb-2 text-primary" size={28} />
          <p className="text-text-muted">
            NEUCC represents the very best of what our department hopes to
            cultivate — curiosity, discipline, and a drive to build. I am
            proud of what this club continues to achieve.
          </p>
          <p className="mt-4 font-heading font-semibold text-text-main">
            Prof. Dr. Shahidul Islam
          </p>
          <p className="text-sm text-text-muted">
            Chairperson, Department of Computer Science &amp; Engineering
          </p>
        </div>
      </div>
    </section>
  );
}
