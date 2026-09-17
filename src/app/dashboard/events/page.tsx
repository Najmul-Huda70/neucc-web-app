import { Suspense } from 'react';
import { EventManagement } from '@/components/dashboard/EventManagement';

export default function DashboardEventsPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-8rem)] bg-background" />}>
      <EventManagement />
    </Suspense>
  );
}
