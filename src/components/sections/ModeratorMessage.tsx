import Image from 'next/image';
import { Quote } from 'lucide-react';

const MODERATORS = [
  {
    name: 'Farhana Ahmed',
    designation: 'Assistant Professor, CSE',
    quote: 'Watching students grow from curious beginners into confident problem-solvers is the most rewarding part of moderating this club.',
    photo: 'https://picsum.photos/seed/neucc-moderator-01/300/300',
  },
  {
    name: 'Kamal Hossain',
    designation: 'Lecturer, CSE',
    quote: 'NEUCC gives students a space to fail, learn, and try again — outside the pressure of a classroom. That freedom is where real learning happens.',
    photo: 'https://picsum.photos/seed/neucc-moderator-02/300/300',
  },
];

export function ModeratorMessage() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          A Word From Our Moderators
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MODERATORS.map((mod) => (
            <div
              key={mod.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <Quote className="text-primary" size={24} />
              <p className="text-sm text-text-muted">{mod.quote}</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border">
                  <Image
                    src={mod.photo}
                    alt={mod.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-text-main">{mod.name}</p>
                  <p className="text-xs text-text-muted">{mod.designation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
