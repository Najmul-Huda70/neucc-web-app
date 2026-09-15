import { Trophy, ShieldCheck, Medal, GraduationCap } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Trophy, label: 'Programming Contest Rank', value: '#5 National' },
  { icon: ShieldCheck, label: 'CTF Wins', value: '3 Championships' },
  { icon: Medal, label: 'ICPC / IUPC Rank', value: 'Asia Regional Qualified' },
  { icon: GraduationCap, label: 'Workshops Conducted', value: '45+ Sessions' },
];

export function HighlightsAchievements() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Highlights &amp; Achievements
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon size={22} />
              </div>
              <p className="font-heading font-semibold text-text-main">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
