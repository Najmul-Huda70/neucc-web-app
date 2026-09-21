import { Suspense } from 'react';
import { ElectionCandidates } from '@/components/dashboard/ElectionCandidates';

export default function DashboardElectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-8rem)] bg-background" />}>
      <ElectionCandidates />
    </Suspense>
  );
}
