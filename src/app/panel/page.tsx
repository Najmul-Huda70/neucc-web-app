import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function PanelPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-border bg-surface p-8 shadow-[0_20px_60px_rgba(17,17,17,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Panel dashboard</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Welcome back, {user.name}
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          You are signed in as {user.role.toLowerCase()} and can manage NEUCC operational data from this secure workspace.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Role', value: user.role },
            { label: 'Committee', value: user.committee ? user.committee.id : 'N/A' },
            { label: 'Post', value: user.post ? user.post.name : 'N/A' },
            { label: 'Status', value: user.status },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-text-main">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
