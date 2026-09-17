import { Suspense } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-8rem)] bg-background" />}>
      <DashboardShell />
    </Suspense>
  );
}
