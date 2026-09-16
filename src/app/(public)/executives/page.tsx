export const metadata = { title: 'Executive Committee', description: 'Meet the current and past executive committees of NEUCC.' };

import { prisma } from '@/lib/prisma';
import { ExecutiveCard } from '@/components/sections/executives/ExecutiveCard';
import { PastCommittees } from '@/components/sections/executives/PastCommittees';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function ExecutivesPage() {
  const committees = await prisma.committee.findMany({
    where: { type: 'EXECUTIVE' },
    orderBy: { startDate: 'desc' },
    include: { members: { include: { post: true }, orderBy: { post: { rank: 'asc' } } } },
  });
  const currentCommitteeRecord = committees[0];
  const currentYear = currentCommitteeRecord?.startDate.getFullYear().toString() ?? 'Current';
  const toExecutive = (member: (typeof committees)[number]['members'][number]) => ({
    id: member.id,
    name: member.name,
    designation: member.post?.name ?? null,
    photo: null,
    rank: member.post?.rank ?? 999,
    year: currentYear,
  });
  const currentCommittee = currentCommitteeRecord?.members.map(toExecutive) ?? [];
  const pastCommittees = committees.slice(1).map((committee) => ({
    year: committee.startDate.getFullYear().toString(),
    members: committee.members.map((member) => ({ ...toExecutive(member), year: committee.startDate.getFullYear().toString() })),
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

      <div className="mt-12">
        {currentCommittee.length === 0 ? <EmptyState title="Executive committee not published" description="The current committee will appear here once its records are added to the database." /> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{currentCommittee.map((executive) => (
          <ExecutiveCard key={executive.id} executive={executive} />
        ))}</div>}
      </div>

      {pastCommittees.length > 0 && <PastCommittees years={pastCommittees} />}
    </div>
  );
}
