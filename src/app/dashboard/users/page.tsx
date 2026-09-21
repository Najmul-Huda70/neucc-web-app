'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPost, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageUsers: boolean } };

type Post = { id: string; name: string; rank: number };
type Committee = { id: string; type: 'ELECTION' | 'EXECUTIVE'; status: 'ACTIVE' | 'DISSOLVED' };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: 'ELECTION_COMMITTEE' | 'EXECUTIVE_COMMITTEE';
  status: 'ACTIVE' | 'REVOKED';
  studentId: string | null;
  batch: number | null;
  electionAccessGranted: boolean;
  post: { id: string; name: string } | null;
  committee: { id: string; type: 'ELECTION' | 'EXECUTIVE'; status: 'ACTIVE' | 'DISSOLVED' } | null;
};

const emptyDraft = {
  name: '',
  email: '',
  password: '',
  postId: '',
  committeeId: '',
  studentId: '',
  batch: '',
};

function randomPassword(): string {
  // Client-side convenience only — the server independently enforces its
  // own 12-char minimum regardless of what's generated here.
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export default function DashboardUsersPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');

  const [draft, setDraft] = useState(emptyDraft);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editPostId, setEditPostId] = useState('');
  const [editCommitteeId, setEditCommitteeId] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);
      if (!meData.capabilities.canManageUsers) return;

      const [usersRes, postsRes, committeesRes] = await Promise.all([
        apiGet<{ data: UserRow[] }>('/api/panel/users?pageSize=100'),
        apiGet<{ data: Post[] }>('/api/panel/posts'),
        apiGet<{ data: Committee[] }>('/api/panel/committees?status=ACTIVE&pageSize=10'),
      ]);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setCommittees(committeesRes.data);
      setDraft((d) => ({ ...d, committeeId: d.committeeId || committeesRes.data[0]?.id || '' }));
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDraft = (key: keyof typeof emptyDraft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setNotice('');
    try {
      await apiPost('/api/panel/users', {
        name: draft.name,
        email: draft.email,
        password: draft.password,
        postId: draft.postId,
        committeeId: draft.committeeId,
        ...(draft.studentId ? { studentId: draft.studentId } : {}),
        ...(draft.batch ? { batch: Number(draft.batch) } : {}),
      });
      setNotice(`Account created for ${draft.name}. Share the password with them directly — it won't be shown again here.`);
      setDraft({ ...emptyDraft, committeeId: draft.committeeId });
      setIsFormOpen(false);
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to create account.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: UserRow) => {
    setEditBusy(true);
    setEditError('');
    try {
      await apiPatch(`/api/panel/users/${user.id}`, { status: user.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE' });
      await load();
    } catch (err) {
      setEditError(err instanceof ApiClientError ? err.message : 'Failed to update status.');
    } finally {
      setEditBusy(false);
    }
  };

  const startEdit = (user: UserRow) => {
    setEditId(user.id);
    setEditPostId(user.post?.id ?? '');
    setEditCommitteeId(user.committee?.id ?? '');
    setEditError('');
  };

  const saveMove = async () => {
    if (!editId) return;
    setEditBusy(true);
    setEditError('');
    try {
      await apiPatch(`/api/panel/users/${editId}`, { postId: editPostId, committeeId: editCommitteeId });
      setEditId(null);
      await load();
    } catch (err) {
      setEditError(err instanceof ApiClientError ? err.message : 'Failed to move member.');
    } finally {
      setEditBusy(false);
    }
  };

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted">Loading users...</main>;
  }
  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{loadError}</p>
      </main>
    );
  }
  if (me && !me.capabilities.canManageUsers) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          Only the President can create or manage committee member accounts.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Committee Members</h1>
            <p className="mt-1 text-sm text-text-muted">
              Create login accounts for Election Committee / Executive Committee members — including the Chief
              Election Commissioner. No demo accounts exist anywhere in this system; this is the only way in.
            </p>
          </div>
          <button type="button" onClick={() => setIsFormOpen((v) => !v)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">
            {isFormOpen ? 'Cancel' : '+ New account'}
          </button>
        </div>

        {notice && <p className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">{notice}</p>}
        {editError && <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{editError}</p>}

        {isFormOpen && (
          <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
            <label className="text-sm text-text-main">Full name<input required minLength={2} value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="text-sm text-text-main">Email<input required type="email" value={draft.email} onChange={(e) => updateDraft('email', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="text-sm text-text-main sm:col-span-2">
              Password (min 12 characters)
              <div className="mt-1 flex gap-2">
                <input required minLength={12} value={draft.password} onChange={(e) => updateDraft('password', e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2" />
                <button type="button" onClick={() => updateDraft('password', randomPassword())} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-main">
                  Generate
                </button>
              </div>
            </label>
            <label className="text-sm text-text-main">
              Post
              <select required value={draft.postId} onChange={(e) => updateDraft('postId', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2">
                <option value="" disabled>Select a post</option>
                {posts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="text-sm text-text-main">
              Committee
              <select required value={draft.committeeId} onChange={(e) => updateDraft('committeeId', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2">
                <option value="" disabled>Select a committee</option>
                {committees.map((c) => <option key={c.id} value={c.id}>{c.type} (active)</option>)}
              </select>
            </label>
            <label className="text-sm text-text-main">Student ID (optional)<input value={draft.studentId} onChange={(e) => updateDraft('studentId', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="text-sm text-text-main">Batch (optional)<input type="number" min={2000} value={draft.batch} onChange={(e) => updateDraft('batch', e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            {committees.length === 0 && (
              <p className="text-sm text-error sm:col-span-2">
                No active committee exists yet — form the Election Committee first on <code>/dashboard/committees</code>.
              </p>
            )}
            {saveError && <p className="text-sm text-error sm:col-span-2">{saveError}</p>}
            <button type="submit" disabled={saving || committees.length === 0} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
              {saving ? 'Creating...' : 'Create account'}
            </button>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {users.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No accounts yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text-main">
                        {u.name}{' '}
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${u.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {u.status}
                        </span>
                        {u.electionAccessGranted && (
                          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Election Access</span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted">
                        {u.email} · {u.post?.name ?? 'No post'} · {u.committee?.type ?? 'No committee'}
                        {u.committee?.status === 'DISSOLVED' ? ' (dissolved)' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(u)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-main">
                        Move
                      </button>
                      <button
                        type="button"
                        disabled={editBusy}
                        onClick={() => void toggleStatus(u)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${u.status === 'ACTIVE' ? 'border-error/30 bg-error/10 text-error' : 'border-success/30 bg-success/10 text-success'}`}
                      >
                        {u.status === 'ACTIVE' ? 'Revoke' : 'Reactivate'}
                      </button>
                    </div>
                  </div>

                  {editId === u.id && (
                    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-3">
                      <label className="text-sm text-text-main">
                        Post
                        <select value={editPostId} onChange={(e) => setEditPostId(e.target.value)} className="mt-1 block rounded-lg border border-border bg-surface px-3 py-2">
                          {posts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </label>
                      <label className="text-sm text-text-main">
                        Committee
                        <select value={editCommitteeId} onChange={(e) => setEditCommitteeId(e.target.value)} className="mt-1 block rounded-lg border border-border bg-surface px-3 py-2">
                          {committees.map((c) => <option key={c.id} value={c.id}>{c.type} (active)</option>)}
                        </select>
                      </label>
                      <button type="button" disabled={editBusy} onClick={() => void saveMove()} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditId(null)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-main">
                        Cancel
                      </button>
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
