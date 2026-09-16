import { Quote } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export async function ModeratorMessage() {
  const block = await prisma.siteContent.findUnique({ where: { key: 'home.moderatorMessage' } });
  const messages = Array.isArray(block?.value) ? block.value as Array<Record<string, unknown>> : [];
  if (messages.length === 0) return null;
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          A Word From Our Moderators
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {messages.map((mod, index) => (
            <div
              key={String(mod.name ?? index)}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <Quote className="text-primary" size={24} />
              <p className="text-sm text-text-muted">{String(mod.quote ?? '')}</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 font-semibold text-primary">M</div>
                <div>
                  <p className="font-semibold text-text-main">{String(mod.name ?? 'Moderator')}</p>
                  <p className="text-xs text-text-muted">{String(mod.designation ?? '')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
