import { Suspense } from 'react';
import { CommitteeGovernance } from '@/components/dashboard/CommitteeGovernance';

export default function DashboardCommitteesPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-8rem)] bg-background" />}>
      <CommitteeGovernance />
    </Suspense>
  );
}
