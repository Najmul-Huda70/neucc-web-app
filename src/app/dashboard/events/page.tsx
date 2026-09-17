import { Suspense } from 'react';
import { EventManagement } from '@/components/dashboard/EventManagement';

type DashboardEventsPageProps = {
  searchParams: Promise<{ role?: string | string[] }>;
};

export default async function DashboardEventsPage({ searchParams }: DashboardEventsPageProps) {
  const params = await searchParams;
  const selectedRole = Array.isArray(params.role) ? params.role[0] : params.role;

  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-8rem)] bg-background" />}>
      <EventManagement selectedRole={selectedRole} />
    </Suspense>
  );
}
