'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageAttendance: boolean; canViewAttendanceOversight: boolean } };

type AttendanceForm = {
  id: string;
  title: string;
  shareToken: string;
  createdAt: string;
  _count: { entries: number };
};

type Entry = { id: string; name: string; studentId: string; batch: number; submittedAt: string };

export default function DashboardAttendancePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [forms, setForms] = useState<AttendanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');

  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);
      if (!meData.capabilities.canManageAttendance && !meData.capabilities.canViewAttendanceOversight) return;

      const formsRes = await apiGet<{ data: AttendanceForm[] }>('/api/panel/attendance/forms?pageSize=50');
      setForms(formsRes.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load attendance forms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setNotice('');
    try {
      await apiPost('/api/panel/attendance/forms', { title });
      setNotice('Attendance form created.');
      setTitle('');
      await load();
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : 'Failed to create form.');
    } finally {
      setCreating(false);
    }
  };

  const toggleEntries = async (formId: string) => {
    if (openFormId === formId) {
      setOpenFormId(null);
      return;
    }
    setOpenFormId(formId);
    setEntriesLoading(true);
    try {
      const res = await apiGet<{ data: Entry[] }>(`/api/panel/attendance/forms/${formId}/entries`);
      setEntries(res.data);
    } catch {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  const copyLink = async (shareToken: string) => {
    const url = `${window.location.origin}/attendance/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Public link copied to clipboard.');
    } catch {
      setNotice(url); // clipboard blocked (e.g. insecure context) — show the URL directly instead
    }
  };

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted">Loading attendance data...</main>;
  }
  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{loadError}</p>
      </main>
    );
  }
  if (me && !me.capabilities.canManageAttendance && !me.capabilities.canViewAttendanceOversight) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          Only the Information Secretary team can create attendance forms; President/General Secretary have view-only access.
        </p>
      </main>
    );
  }

  const canCreate = !!me?.capabilities.canManageAttendance;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Attendance</h1>
        </div>

        {notice && <p className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">{notice}</p>}

        {canCreate && (
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-heading text-lg font-bold text-text-main">New Attendance Form</h2>
            <form onSubmit={handleCreate} className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-sm text-text-main">
                Title
                <input required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-64 rounded-lg border border-border bg-background px-3 py-2" />
              </label>
              <button type="submit" disabled={creating} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {creating ? 'Creating...' : 'Create form'}
              </button>
            </form>
            {createError && <p className="mt-2 text-sm text-error">{createError}</p>}
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {forms.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No attendance forms yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {forms.map((f) => (
                <div key={f.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text-main">{f.title}</p>
                      <p className="text-xs text-text-muted">{f._count.entries} submission(s) · created {new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void copyLink(f.shareToken)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-main">
                        Copy public link
                      </button>
                      <button type="button" onClick={() => void toggleEntries(f.id)} className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                        {openFormId === f.id ? 'Hide entries' : 'View entries'}
                      </button>
                    </div>
                  </div>

                  {openFormId === f.id && (
                    <div className="mt-3 rounded-lg border border-border bg-background p-3">
                      {entriesLoading ? (
                        <p className="text-sm text-text-muted">Loading entries...</p>
                      ) : entries.length === 0 ? (
                        <p className="text-sm text-text-muted">No submissions yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {entries.map((e) => (
                            <div key={e.id} className="flex justify-between text-sm">
                              <span className="text-text-main">{e.name} · {e.studentId} · batch {e.batch}</span>
                              <span className="text-text-muted">{new Date(e.submittedAt).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
