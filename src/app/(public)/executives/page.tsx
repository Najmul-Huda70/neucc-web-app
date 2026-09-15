import { executives } from '@/data/executives';
import { ExecutiveCard } from '@/components/sections/executives/ExecutiveCard';
import { PastCommittees } from '@/components/sections/executives/PastCommittees';

export default function ExecutivesPage() {
  const currentYear = '2026';
  const currentCommittee = executives
    .filter((exec) => exec.year === currentYear)
    .sort((a, b) => a.rank - b.rank);

  const pastYears = Array.from(
    new Set(executives.filter((exec) => exec.year !== currentYear).map((exec) => exec.year)),
  ).sort((a, b) => Number(b) - Number(a));

  const pastCommittees = pastYears.map((year) => ({
    year,
    members: executives
      .filter((exec) => exec.year === year)
      .sort((a, b) => a.rank - b.rank),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Executive Committee
        </h1>
        <p className="mt-3 text-text-muted">
          Meet the {currentYear} team leading NEUCC.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {currentCommittee.map((executive) => (
          <ExecutiveCard key={executive.id} executive={executive} />
        ))}
      </div>

      {pastCommittees.length > 0 && <PastCommittees years={pastCommittees} />}
    </div>
  );
}
