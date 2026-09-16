import { Quote } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export async function ChairpersonMessage() {
  const block = await prisma.siteContent.findUnique({ where: { key: 'home.chairpersonMessage' } });
  const message = typeof block?.value === 'object' && block.value && 'message' in block.value ? String(block.value.message) : '';
  if (!message) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-surface p-8 sm:flex-row sm:p-10">
        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-3xl font-semibold text-primary sm:h-36 sm:w-36">C</div>
        <div>
          <Quote className="mb-2 text-primary" size={28} />
          <p className="text-text-muted">
            {message}
          </p>
          <p className="mt-4 font-heading font-semibold text-text-main">
            {typeof block?.value === 'object' && block.value && 'name' in block.value ? String(block.value.name) : 'Chairperson'}
          </p>
          <p className="text-sm text-text-muted">
            Chairperson, Department of Computer Science &amp; Engineering
          </p>
        </div>
      </div>
    </section>
  );
}
