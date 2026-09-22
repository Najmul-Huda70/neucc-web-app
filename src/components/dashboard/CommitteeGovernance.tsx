'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Building2, KeyRound, Loader2, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { apiGet, apiPost, apiDelete, ApiClientError } from '@/lib/api-client';

type Capabilities = {
  canGrantElectionAccess: boolean;
  canDissolveExecutive: boolean;
  canCreateElectionCommittee: boolean;
  canManageUsers: boolean;
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

type ElectionCommitteeUser = {
  id: string;
  name: string;
  post: { name: string } | null;
  electionAccessGranted: boolean;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CommitteeGovernance() {
  const [me, setMe] = useState<Me | null>(null);
  const [executiveCommittee, setExecutiveCommittee] = useState<Committee | null>(null);
  const [electionCommittee, setElectionCommittee] = useState<Committee | null>(null);
  const [electionCommitteeUsers, setElectionCommitteeUsers] = useState<ElectionCommitteeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form Election Committee
  const [formStartDate, setFormStartDate] = useState(todayInputValue());
  const [forming, setForming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Grant/revoke election access
  const [accessBusyId, setAccessBusyId] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);

      const [executive, election] = await Promise.all([
        apiGet<{ data: Committee[] }>('/api/panel/committees?type=EXECUTIVE&status=ACTIVE&pageSize=1'),
        apiGet<{ data: Committee[] }>('/api/panel/committees?type=ELECTION&status=ACTIVE&pageSize=1'),
      ]);
      setExecutiveCommittee(executive.data[0] ?? null);
      setElectionCommittee(election.data[0] ?? null);

      // Only the President can list users (user:manage), and only the
      // President needs this list (to grant/revoke the Chief Election
      // Commissioner's Election Module access) — skip it for everyone else.
      if (meData.capabilities.canGrantElectionAccess && election.data[0]) {
        const users = await apiGet<{ data: ElectionCommitteeUser[] }>(
          `/api/panel/users?committeeId=${election.data[0].id}&pageSize=100`
        );
        setElectionCommitteeUsers(users.data);
      } else {
        setElectionCommitteeUsers([]);
      }
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load committee data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFormElectionCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    setForming(true);
    setFormError(null);
    setActionSuccess(null);
    try {
      await apiPost('/api/panel/committees', {
        type: 'ELECTION',
        status: 'ACTIVE',
        startDate: formStartDate,
      });
      setActionSuccess(
        "Election Committee formed. Create the Chief Election Commissioner's account from Members Access, then grant them Election Module access below."
      );
      await load();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Failed to form the Election Committee.');
    } finally {
      setForming(false);
    }
  };

  const handleToggleAccess = async (user: ElectionCommitteeUser) => {
    setAccessBusyId(user.id);
    setAccessError(null);
    setActionSuccess(null);
    try {
      if (user.electionAccessGranted) {
        await apiDelete(`/api/panel/users/${user.id}/grant-election-access`);
        setActionSuccess(`Election Module access revoked for ${user.name}.`);
      } else {
        await apiPost(`/api/panel/users/${user.id}/grant-election-access`);
        setActionSuccess(`Election Module access granted to ${user.name}.`);
      }
      await load();
    } catch (err) {
      setAccessError(err instanceof ApiClientError ? err.message : 'Failed to update election access.');
    } finally {
      setAccessBusyId(null);
    }
  };

  const handleDissolve = async () => {
    setDissolving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiPost('/api/panel/committees/dissolve-executive');
      setActionSuccess('The Executive Committee has been dissolved. Its members have lost panel access.');
      setShowConfirm(false);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Failed to dissolve the committee.');
    } finally {
      setDissolving(false);
    }
  };

  const chiefElectionCommissioners = electionCommitteeUsers.filter(
    (u) => u.post?.name === 'Chief Election Commissioner'
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="font-heading text-2xl font-bold text-text-main">Committee Governance</h1>
          <p className="mt-1 text-sm text-text-muted">
            Form the Election Committee, grant it access to run an election, view the active Executive
            Committee, and (if you are the Chief Election Commissioner with granted access) dissolve it to
            start the handover cycle.
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

        {actionSuccess && (
          <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {actionSuccess}
          </div>
        )}

        {!loading && !loadError && me && (
          <>
            {/* Election Committee section */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-bold text-text-main">Election Committee</h2>
              </div>

              {!electionCommittee ? (
                me.capabilities.canCreateElectionCommittee ? (
                  <form onSubmit={handleFormElectionCommittee} className="space-y-3">
                    <p className="text-sm text-text-muted">
                      No active Election Committee right now. As President, form one to begin the next
                      election cycle (SRS §5.3) — you can then create the Chief Election Commissioner&apos;s
                      account from Members Access and grant them Election Module access below.
                    </p>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-sm text-text-main">
                        Start date
                        <input
                          type="date"
                          required
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="mt-1 block rounded-lg border border-border bg-background px-3 py-2"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={forming}
                        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {forming ? 'Forming...' : 'Form Election Committee'}
                      </button>
                    </div>
                    {formError && <p className="text-sm text-red-700">{formError}</p>}
                  </form>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                    There is no active Election Committee right now.
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                    Active since {new Date(electionCommittee.startDate).toLocaleDateString()}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {electionCommittee.members.length === 0 ? (
                      <p className="text-sm text-text-muted">
                        No members yet. Create the Chief Election Commissioner&apos;s account from Members
                        Access.
                      </p>
                    ) : (
                      electionCommittee.members.map((member) => (
                        <div key={member.id} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                          <p className="font-medium text-text-main">{member.name}</p>
                          <p className="text-text-muted">{member.post?.name ?? 'No post assigned'}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {me.capabilities.canGrantElectionAccess && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-text-main">Election Module Access</h3>
                      </div>
                      {chiefElectionCommissioners.length === 0 ? (
                        <p className="text-sm text-text-muted">
                          No Chief Election Commissioner account exists yet. Create one from Members Access
                          first, using the post &quot;Chief Election Commissioner&quot;.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {chiefElectionCommissioners.map((u) => (
                            <div
                              key={u.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-text-main">{u.name}</p>
                                <p className="text-xs text-text-muted">
                                  {u.electionAccessGranted ? 'Has Election Module access' : 'No Election Module access yet'}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={accessBusyId === u.id}
                                onClick={() => handleToggleAccess(u)}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                                  u.electionAccessGranted
                                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                              >
                                {accessBusyId === u.id ? 'Working...' : u.electionAccessGranted ? 'Revoke access' : 'Grant access'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {accessError && <p className="mt-2 text-sm text-red-700">{accessError}</p>}
                      <p className="mt-2 text-xs text-text-muted">
                        Granting access lets the Chief Election Commissioner manage the Election Module and,
                        once results are declared, dissolve the outgoing Executive Committee.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Executive Committee section */}
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
          </>
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
