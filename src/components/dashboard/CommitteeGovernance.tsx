'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Building2, Loader2, ShieldAlert, X } from 'lucide-react';

type Capabilities = {
  canGrantElectionAccess: boolean;
  canDissolveExecutive: boolean;
  [key: string]: boolean;
};

type Me = {
  id: string;
  name: string;
  role: 'ELECTION_COMMITTEE' | 'EXECUTIVE_COMMITTEE';
  post: string | null;
  committeeStatus: string | null;
  capabilities: Capabilities;
};

type CommitteeMember = {
  id: string;
  name: string;
  post: { name: string } | null;
};

type Committee = {
  id: string;
  type: 'ELECTION' | 'EXECUTIVE';
  status: 'ACTIVE' | 'DISSOLVED';
  startDate: string;
  endDate: string | null;
  dissolvedAt: string | null;
  members: CommitteeMember[];
};

type ApiError = { error?: { message?: string } };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    throw new Error((body as ApiError)?.error?.message ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export function CommitteeGovernance() {
  const [me, setMe] = useState<Me | null>(null);
  const [executiveCommittee, setExecutiveCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const meData = await fetchJson<Me>('/api/panel/me');
      setMe(meData);

      const committees = await fetchJson<{ data: Committee[] }>(
        '/api/panel/committees?type=EXECUTIVE&status=ACTIVE&pageSize=1'
      );
      setExecutiveCommittee(committees.data[0] ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load committee data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDissolve = async () => {
    setDissolving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/panel/committees/dissolve-executive', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        throw new Error((body as ApiError)?.error?.message ?? `Request failed (${res.status})`);
      }
      setActionSuccess('The Executive Committee has been dissolved. Its members have lost panel access.');
      setShowConfirm(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to dissolve the committee.');
    } finally {
      setDissolving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="font-heading text-2xl font-bold text-text-main">Committee Governance</h1>
          <p className="mt-1 text-sm text-text-muted">
            View the active Executive Committee and, if you are the Chief Election Commissioner with
            granted access, dissolve it to start the election handover cycle.
          </p>
        </header>

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading committee data...
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-medium">Couldn&apos;t load committee data</p>
            <p className="mt-1">{loadError}</p>
          </div>
        )}

        {!loading && !loadError && me && (
          <section className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-bold text-text-main">Active Executive Committee</h2>
            </div>

            {!executiveCommittee ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                There is no active Executive Committee right now.
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  In office since {new Date(executiveCommittee.startDate).toLocaleDateString()}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {executiveCommittee.members.length === 0 ? (
                    <p className="text-sm text-text-muted">No members recorded yet.</p>
                  ) : (
                    executiveCommittee.members.map((member) => (
                      <div key={member.id} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <p className="font-medium text-text-main">{member.name}</p>
                        <p className="text-text-muted">{member.post?.name ?? 'No post assigned'}</p>
                      </div>
                    ))
                  )}
                </div>

                {me.capabilities.canDissolveExecutive ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setShowConfirm(true);
                      }}
                      className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Dissolve Executive Committee
                    </button>
                    <p className="mt-2 text-xs text-text-muted">
                      This immediately revokes panel access for every current Executive Committee member.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs text-text-muted">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Only the Chief Election Commissioner, after the President grants election module
                      access, can dissolve the Executive Committee.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {actionSuccess && (
          <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {actionSuccess}
          </div>
        )}
        {actionError && !showConfirm && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{actionError}</div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-heading text-lg font-bold">Dissolve Executive Committee?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                aria-label="Close"
                className="text-text-muted hover:text-text-main"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-main">
              This will immediately dissolve the current Executive Committee and revoke panel access for
              all {executiveCommittee?.members.length ?? 0} of its members. This action cannot be undone
              from the panel.
            </p>

            {actionError && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={dissolving}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDissolve}
                disabled={dissolving}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {dissolving && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, dissolve it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
