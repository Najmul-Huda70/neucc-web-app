import { Eye, Target } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export async function MissionVision() {
  const blocks = await prisma.siteContent.findMany({
    where: { key: { in: ['about.mission', 'about.vision'] } },
  });
  const content = Object.fromEntries(
    blocks.map((block) => [block.key, typeof block.value === 'string' ? block.value : '']),
  );

  const items = [
    {
      title: 'Our Mission',
      value: content['about.mission'],
      icon: Target,
    },
    {
      title: 'Our Vision',
      value: content['about.vision'],
      icon: Eye,
    },
  ];

  return (
    <section className="border-y border-border bg-card-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-badge-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-badge-text">
            What guides us
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
            Built with purpose. Growing with people.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items.map(({ title, value, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={22} />
              </div>
              <h3 className="mt-6 font-heading text-xl font-bold text-text-main">{title}</h3>
              <p className="mt-3 leading-7 text-text-muted">
                {value || 'Creating a connected, skilled, and future-ready student community.'}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}