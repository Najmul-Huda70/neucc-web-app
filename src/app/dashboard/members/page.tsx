'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPatch, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageMembership: boolean; canViewContactMessages: boolean } };

type Application = {
  id: string;
  name: string;
  studentId: string;
  batch: number;
  email: string;
  interest: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function DashboardMembersPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);

      if (meData.capabilities.canManageMembership) {
        const apps = await apiGet<{ data: Application[] }>('/api/panel/membership-applications?status=PENDING&pageSize=50');
        setApplications(apps.data);
      }
      if (meData.capabilities.canViewContactMessages) {
        const msgs = await apiGet<{ data: ContactMessage[] }>('/api/panel/contact-messages?pageSize=30');
        setMessages(msgs.data);
      }
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(id);
    setActionError('');
    try {
      await apiPatch(`/api/panel/membership-applications/${id}`, { status });
      setApplications((current) => current.filter((a) => a.id !== id));
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Failed to update application.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted">Loading...</main>;
  }
  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{loadError}</p>
      </main>
    );
  }
  if (me && !me.capabilities.canManageMembership && !me.capabilities.canViewContactMessages) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          Only the President or General Secretary can review Join Us applications and Contact messages.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Members &amp; Messages</h1>
        </div>

        {actionError && <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{actionError}</p>}

        {me?.capabilities.canManageMembership && (
          <section>
            <h2 className="font-heading text-lg font-bold text-text-main">Pending Join Us Applications</h2>
            <p className="mt-1 text-sm text-text-muted">
              Approving does not create a login account — Club Members are not a login role in this system (only
              Election Committee and Executive Committee members log in). This just records their membership status.
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
              {applications.length === 0 ? (
                <p className="p-5 text-sm text-text-muted">No pending applications.</p>
              ) : (
                <div className="divide-y divide-border">
                  {applications.map((a) => (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-medium text-text-main">{a.name} <span className="text-xs text-text-muted">· {a.studentId} · batch {a.batch}</span></p>
                        <p className="text-xs text-text-muted">{a.email}{a.interest ? ` · ${a.interest}` : ''}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => void decide(a.id, 'APPROVED')}
                          className="rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => void decide(a.id, 'REJECTED')}
                          className="rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {me?.capabilities.canViewContactMessages && (
          <section>
            <h2 className="font-heading text-lg font-bold text-text-main">Contact Messages</h2>
            <p className="mt-1 text-sm text-text-muted">Read-only — reply directly by email.</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
              {messages.length === 0 ? (
                <p className="p-5 text-sm text-text-muted">No messages yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {messages.map((m) => (
                    <div key={m.id} className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-text-main">{m.subject}</p>
                        <p className="text-xs text-text-muted">{new Date(m.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-text-muted">{m.name} · {m.email}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-text-main">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
