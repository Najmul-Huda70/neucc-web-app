import Image from 'next/image';

const COLLABORATIONS = [
  { name: 'TechNova Solutions', logo: 'https://picsum.photos/seed/neucc-collab-01/200/100' },
  { name: 'CloudBridge BD', logo: 'https://picsum.photos/seed/neucc-collab-02/200/100' },
  { name: 'DevWorks Ltd.', logo: 'https://picsum.photos/seed/neucc-collab-03/200/100' },
  { name: 'CyberSafe BD', logo: 'https://picsum.photos/seed/neucc-collab-04/200/100' },
  { name: 'BuildStack', logo: 'https://picsum.photos/seed/neucc-collab-05/200/100' },
  { name: 'DataSphere Analytics', logo: 'https://picsum.photos/seed/neucc-collab-06/200/100' },
];

export function FeaturedCollaborations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
        Featured Collaborations
      </h2>
      <div className="mt-10 flex gap-8 overflow-x-auto pb-4">
        {COLLABORATIONS.map((partner) => (
          <div
            key={partner.name}
            className="flex w-40 flex-shrink-0 flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <div className="relative h-16 w-full">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="160px"
                className="rounded-md object-cover"
              />
            </div>
            <p className="text-center text-xs text-text-muted">{partner.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
