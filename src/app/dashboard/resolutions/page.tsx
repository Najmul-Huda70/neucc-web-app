'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageResolution: boolean } };

type Resolution = {
  id: string;
  meetingNo: string;
  memoNo: string;
  date: string;
  venue: string;
  agenda: string;
  decisions: string;
  attendeeCount: number;
};

const emptyDraft = {
  meetingNo: '',
  memoNo: '',
  date: new Date().toISOString().slice(0, 10),
  meetingTime: '',
  venue: '',
  president: '',
  convener: '',
  agenda: '',
  discussion: '',
  decisions: '',
  attendeeCount: '',
};

export default function DashboardResolutionsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);
      if (!meData.capabilities.canManageResolution) return;
      const res = await apiGet<{ data: Resolution[] }>('/api/panel/resolutions?pageSize=30');
      setResolutions(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load resolutions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDraft = (key: keyof typeof emptyDraft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await apiPost('/api/panel/resolutions', { ...draft, attendeeCount: Number(draft.attendeeCount) });
      setIsFormOpen(false);
      setDraft(emptyDraft);
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to save resolution.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted">Loading resolutions...</main>;
  }
  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{loadError}</p>
      </main>
    );
  }
  if (me && !me.capabilities.canManageResolution) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          Only the Information Secretary team can manage resolutions.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Resolutions</h1>
          </div>
          <button type="button" onClick={() => setIsFormOpen((v) => !v)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">
            {isFormOpen ? 'Cancel' : '+ New resolution'}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-text-main">Meeting No.<input required value={draft.meetingNo} onChange={(e) => updateDraft('meetingNo', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">Memo No.<input required value={draft.memoNo} onChange={(e) => updateDraft('memoNo', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">Date<input required type="date" value={draft.date} onChange={(e) => updateDraft('date', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">Meeting Time<input required value={draft.meetingTime} onChange={(e) => updateDraft('meetingTime', e.target.value)} placeholder="e.g. 4:00 PM" className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">Venue<input required value={draft.venue} onChange={(e) => updateDraft('venue', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">Attendee Count<input required type="number" min={0} value={draft.attendeeCount} onChange={(e) => updateDraft('attendeeCount', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">President<input required value={draft.president} onChange={(e) => updateDraft('president', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
              <label className="text-sm text-text-main">Convener<input required value={draft.convener} onChange={(e) => updateDraft('convener', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            </div>
            <label className="block text-sm text-text-main">Agenda<textarea required rows={2} value={draft.agenda} onChange={(e) => updateDraft('agenda', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="block text-sm text-text-main">Discussion<textarea required rows={3} value={draft.discussion} onChange={(e) => updateDraft('discussion', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="block text-sm text-text-main">Decisions<textarea required rows={3} value={draft.decisions} onChange={(e) => updateDraft('decisions', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            {saveError && <p className="text-sm text-error">{saveError}</p>}
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Save resolution'}
            </button>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {resolutions.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No resolutions recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {resolutions.map((r) => (
                <div key={r.id} className="p-4">
                  <p className="font-medium text-text-main">Meeting {r.meetingNo} · {r.memoNo}</p>
                  <p className="text-xs text-text-muted">{new Date(r.date).toLocaleDateString()} · {r.venue} · {r.attendeeCount} attendees</p>
                  <p className="mt-2 text-sm text-text-muted"><span className="font-medium text-text-main">Agenda:</span> {r.agenda}</p>
                  <p className="mt-1 text-sm text-text-muted"><span className="font-medium text-text-main">Decisions:</span> {r.decisions}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
