'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Award, Key, Loader2, RotateCcw, ShieldAlert, Trophy, X } from 'lucide-react';

type Me = { capabilities: { canManageElection: boolean } };

type Post = { id: string; name: string; eligibleYear: number | null; rank: number };

type Election = {
  id: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'RESULTS_PUBLISHED';
  applicationDeadline: string;
  votingDate: string;
  reopenedPostIds: string[];
};

type Candidate = {
  id: string;
  postId: string;
  applicantName: string;
  studentId: string;
  batch: number;
  status: 'PENDING' | 'VERIFIED' | 'SYMBOL_ALLOTTED' | 'UNOPPOSED' | 'REJECTED';
  isWinner: boolean;
  isUnopposed: boolean;
};

type CreatedAccount = { post: string; name: string; email: string; tempPassword: string; emailSent: boolean };

type PublishResult = {
  election: Election;
  newCommittee: { id: string };
  createdAccounts: CreatedAccount[];
};

type ApiError = { error?: { message?: string; details?: unknown } };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) throw new Error((body as ApiError)?.error?.message ?? `Request failed (${res.status})`);
  return body as T;
}

async function postJson<T = { ok: true }>(url: string, body?: unknown): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const res = await fetch(url, {
    method: 'POST',
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = json as ApiError;
    const detail = err?.error?.details && typeof err.error.details === 'object' ? JSON.stringify(err.error.details) : '';
    return { ok: false, message: `${err?.error?.message ?? `Request failed (${res.status})`}${detail ? ` — ${detail}` : ''}` };
  }
  return { ok: true, data: (json as { data: T }).data ?? (json as T) };
}

async function patchJson(url: string, body: unknown): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (json as ApiError)?.error?.message ?? `Request failed (${res.status})` };
  return { ok: true };
}

const STATUS_STYLES: Record<Candidate['status'], string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  VERIFIED: 'bg-blue-50 text-blue-700 border-blue-300',
  SYMBOL_ALLOTTED: 'bg-primary/10 text-primary border-primary/30',
  UNOPPOSED: 'bg-green-50 text-green-700 border-green-300',
  REJECTED: 'bg-red-50 text-red-700 border-red-300',
};

export function ElectionCandidates() {
  const [me, setMe] = useState<Me | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null); // `${action}:${postId|candidateId}`
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  const loadElectionsAndPosts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const meData = await fetchJson<Me>('/api/panel/me');
      setMe(meData);
      if (!meData.capabilities.canManageElection) return;

      const [electionsRes, postsRes] = await Promise.all([
        fetchJson<{ data: Election[] }>('/api/panel/elections?pageSize=50'),
        fetchJson<{ data: Post[] }>('/api/panel/posts'),
      ]);
      setElections(electionsRes.data);
      setPosts(postsRes.data);

      const preferred = electionsRes.data.find((e) => e.status === 'OPEN' || e.status === 'CLOSED') ?? electionsRes.data[0];
      if (preferred) setSelectedElectionId(preferred.id);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load election data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCandidates = useCallback(async (electionId: string) => {
    if (!electionId) return;
    try {
      const res = await fetchJson<{ data: Candidate[] }>(
        `/api/panel/candidates?electionId=${encodeURIComponent(electionId)}&pageSize=200`
      );
      setCandidates(res.data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load candidates.');
    }
  }, []);

  useEffect(() => {
    loadElectionsAndPosts();
  }, [loadElectionsAndPosts]);

  useEffect(() => {
    if (selectedElectionId) loadCandidates(selectedElectionId);
  }, [selectedElectionId, loadCandidates]);

  const selectedElection = useMemo(
    () => elections.find((e) => e.id === selectedElectionId) ?? null,
    [elections, selectedElectionId]
  );

  const candidatesByPost = useMemo(() => {
    const map = new Map<string, Candidate[]>();
    for (const c of candidates) {
      if (!map.has(c.postId)) map.set(c.postId, []);
      map.get(c.postId)!.push(c);
    }
    return map;
  }, [candidates]);

  // Every post must be resolved before Publish is allowed: either it has a
  // marked winner/uncontested candidate, or it has zero applicants (vacant).
  // Mirrors the backend's own check, so the button is disabled instead of
  // failing after a click whenever possible.
  const unresolvedPosts = useMemo(() => {
    return posts.filter((post) => {
      const list = candidatesByPost.get(post.id) ?? [];
      const live = list.filter((c) => c.status !== 'REJECTED');
      if (live.length === 0) return false; // vacant post — fine, resolves to NO_CANDIDATE
      if (live.some((c) => c.isUnopposed)) return false;
      if (live.some((c) => c.isWinner)) return false;
      return true; // contested, nobody marked yet
    });
  }, [posts, candidatesByPost]);

  const runPostAction = async (kind: 'reopen' | 'declare-uncontested', postId: string) => {
    if (!selectedElectionId) return;
    setBusyKey(`${kind}:${postId}`);
    setActionMessage(null);
    const result = await postJson(`/api/panel/elections/${selectedElectionId}/posts/${postId}/${kind}`);
    if (result.ok) {
      setActionMessage({ type: 'success', text: kind === 'reopen' ? 'Post reopened to all members.' : 'Post declared uncontested.' });
      await Promise.all([loadElectionsAndPosts(), loadCandidates(selectedElectionId)]);
    } else {
      setActionMessage({ type: 'error', text: result.message });
    }
    setBusyKey(null);
  };

  const markWinner = async (candidateId: string) => {
    setBusyKey(`winner:${candidateId}`);
    setActionMessage(null);
    const result = await patchJson(`/api/panel/candidates/${candidateId}`, { isWinner: true });
    if (result.ok) {
      setActionMessage({ type: 'success', text: 'Candidate marked as winner.' });
      await loadCandidates(selectedElectionId);
    } else {
      setActionMessage({ type: 'error', text: result.message ?? 'Failed to mark winner.' });
    }
    setBusyKey(null);
  };

  const handlePublish = async () => {
    if (!selectedElectionId) return;
    setPublishing(true);
    setPublishError(null);
    const result = await postJson<PublishResult>(`/api/panel/elections/${selectedElectionId}/publish-results`);
    if (result.ok) {
      setPublishResult(result.data);
      setShowPublishConfirm(false);
      await loadElectionsAndPosts();
    } else {
      setPublishError(result.message);
    }
    setPublishing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center gap-2 bg-background text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading election data...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (me && !me.capabilities.canManageElection) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background p-8">
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Only active Election Committee members can manage candidates and posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-main">Election — Posts &amp; Candidates</h1>
            <p className="mt-1 text-sm text-text-muted">
              Reopen zero-applicant posts, declare uncontested winners, mark contested winners, then publish results.
            </p>
          </div>

          {elections.length > 0 && (
            <label className="text-sm text-text-main">
              <span className="mr-2 text-text-muted">Election:</span>
              <select
                value={selectedElectionId}
                onChange={(e) => {
                  setSelectedElectionId(e.target.value);
                  setPublishResult(null);
                }}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {elections.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id.slice(0, 8)}… — {e.status}
                  </option>
                ))}
              </select>
            </label>
          )}
        </header>

        {elections.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-text-muted">
            No elections yet. Create one from <code>POST /api/panel/elections</code>.
          </div>
        )}

        {actionMessage && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              actionMessage.type === 'success' ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {publishResult && (
          <section className="rounded-xl border border-green-300 bg-green-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-green-800">
              <Key className="h-5 w-5" />
              <h2 className="font-heading text-lg font-bold">Results published — new account credentials</h2>
            </div>
            <p className="mb-3 text-sm text-green-800">
              Passwords marked <strong>emailed</strong> were sent automatically — no further action needed. For any
              marked <strong>share manually</strong> (email delivery failed or SMTP isn&apos;t configured), relay the
              password yourself through a trusted channel. Shown once, never stored as plaintext.
            </p>
            <div className="space-y-2">
              {publishResult.createdAccounts.map((acc) => (
                <div key={acc.email} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-text-main">{acc.name} · {acc.post}</span>
                  <span className="text-text-muted">{acc.email}</span>
                  <code className="rounded bg-green-100 px-2 py-0.5 text-green-800">{acc.tempPassword}</code>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${acc.emailSent ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    {acc.emailSent ? 'emailed' : 'share manually'}
                  </span>
                </div>
              ))}
              {publishResult.createdAccounts.length === 0 && (
                <p className="text-sm text-green-800">No new accounts were created (every post resolved to NO_CANDIDATE).</p>
              )}
            </div>
          </section>
        )}

        {selectedElection && (
          <>
            <div className="space-y-4">
              {posts.map((post) => {
                const postCandidates = candidatesByPost.get(post.id) ?? [];
                const nonRejected = postCandidates.filter((c) => c.status !== 'REJECTED');
                const verified = postCandidates.filter((c) => c.status === 'VERIFIED' || c.status === 'SYMBOL_ALLOTTED');
                const isReopened = selectedElection.reopenedPostIds.includes(post.id);
                const canReopen = nonRejected.length === 0 && !isReopened;
                const canDeclareUncontested = verified.length === 1;
                const hasWinner = nonRejected.some((c) => c.isWinner || c.isUnopposed);
                const isContested = nonRejected.length > 1;

                return (
                  <section key={post.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-base font-bold text-text-main">{post.name}</h2>
                        <p className="text-xs text-text-muted">
                          {nonRejected.length} application(s)
                          {isReopened && ' • reopened to all members'}
                          {hasWinner && ' • winner declared'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {canReopen && (
                          <button
                            type="button"
                            disabled={busyKey === `reopen:${post.id}`}
                            onClick={() => runPostAction('reopen', post.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
                          >
                            {busyKey === `reopen:${post.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                            Reopen to all members
                          </button>
                        )}
                        {canDeclareUncontested && (
                          <button
                            type="button"
                            disabled={busyKey === `declare-uncontested:${post.id}`}
                            onClick={() => runPostAction('declare-uncontested', post.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            {busyKey === `declare-uncontested:${post.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trophy className="h-3.5 w-3.5" />}
                            Declare uncontested
                          </button>
                        )}
                      </div>
                    </div>

                    {postCandidates.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {postCandidates.map((c) => (
                          <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                            <span className="text-text-main">
                              {c.applicantName} <span className="text-text-muted">· {c.studentId} · batch {c.batch}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[c.status]}`}>
                                {c.status}
                              </span>
                              {c.isWinner && (
                                <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                  <Award className="h-3 w-3" /> Winner
                                </span>
                              )}
                              {isContested && !hasWinner && (c.status === 'VERIFIED' || c.status === 'SYMBOL_ALLOTTED') && (
                                <button
                                  type="button"
                                  disabled={busyKey === `winner:${c.id}`}
                                  onClick={() => markWinner(c.id)}
                                  className="rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-text-main hover:bg-surface disabled:opacity-50"
                                >
                                  {busyKey === `winner:${c.id}` ? 'Marking…' : 'Mark as winner'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="font-heading text-lg font-bold text-text-main">Publish Election Results</h2>
              <p className="mt-1 text-sm text-text-muted">
                Creates the next Executive Committee, opens an account for every winner, dissolves this Election
                Committee, and marks the election as published — all at once, and only once.
              </p>

              {selectedElection.status === 'RESULTS_PUBLISHED' ? (
                <p className="mt-4 text-sm font-medium text-green-700">Results have already been published for this election.</p>
              ) : selectedElection.status !== 'CLOSED' ? (
                <p className="mt-4 text-sm text-text-muted">
                  This election must be <strong>CLOSED</strong> (voting finished) before results can be published.
                  Current status: <strong>{selectedElection.status}</strong>.
                </p>
              ) : unresolvedPosts.length > 0 ? (
                <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                  <p className="font-medium">{unresolvedPosts.length} post(s) still need a winner:</p>
                  <ul className="mt-1 list-inside list-disc">
                    {unresolvedPosts.map((p) => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPublishError(null);
                    setShowPublishConfirm(true);
                  }}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Publish Election Results
                </button>
              )}
            </section>
          </>
        )}
      </div>

      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-heading text-lg font-bold">Publish results?</h3>
              </div>
              <button type="button" onClick={() => setShowPublishConfirm(false)} aria-label="Close" className="text-text-muted hover:text-text-main">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-main">
              This immediately creates the new Executive Committee, opens a login for every declared winner, and
              dissolves this Election Committee. This cannot be undone from the panel.
            </p>

            {publishError && <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{publishError}</div>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                disabled={publishing}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, publish results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
