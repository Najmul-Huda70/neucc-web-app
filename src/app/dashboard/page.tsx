import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-8rem)] bg-background" />}>
      <DashboardOverview />
    </Suspense>
  );
}
