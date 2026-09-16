import { prisma } from '@/lib/prisma';

export async function FeaturedCollaborations() {
  const collaborations = await prisma.sponsor.findMany({ orderBy: [{ tier: 'asc' }, { name: 'asc' }], take: 6 });
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
        Featured Collaborations
      </h2>
      <div className="mt-10 flex gap-8 overflow-x-auto pb-4">
        {collaborations.map((partner) => (
          <div
            key={partner.name}
            className="flex w-40 flex-shrink-0 flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <div className="relative h-16 w-full">
              <span className="flex h-full items-center justify-center text-2xl font-semibold text-primary">{partner.name.charAt(0)}</span>
            </div>
            <p className="text-center text-xs text-text-muted">{partner.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
