import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getCapabilities } from '@/lib/auth/capabilities';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // No shared layout previously guarded these routes — every /dashboard/*
  // page had to fetch /api/panel/me client-side and render its own error
  // state on a 401. That still works as a defence-in-depth layer, but an
  // unauthenticated visitor should never see a bare "Unauthorized" flash;
  // send them straight to /login with a return path instead.
  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const capabilities = getCapabilities(user);

  return (
    <div className="flex min-h-[70vh] flex-col bg-background lg:flex-row">
      <DashboardNav
        user={{ name: user.name, post: user.post?.name ?? null, role: user.role }}
        capabilities={capabilities}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
