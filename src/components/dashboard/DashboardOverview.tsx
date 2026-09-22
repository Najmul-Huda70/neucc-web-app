'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Building2, Vote, Wallet, Megaphone, ClipboardList,
  FileText, FolderOpen, Mail, CalendarDays, ShieldAlert, Loader2, Image as ImageIcon,
} from 'lucide-react';
import { apiGet, ApiClientError } from '@/lib/api-client';

type Me = {
  name: string;
  post: string | null;
  role: 'ELECTION_COMMITTEE' | 'EXECUTIVE_COMMITTEE';
  committeeStatus: 'ACTIVE' | 'DISSOLVED' | null;
  capabilities: Record<string, boolean>;
};

type Card = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  show: (c: Me['capabilities']) => boolean;
};

const CARDS: Card[] = [
  { href: '/dashboard/users', label: 'Members Access', description: 'Create and manage committee-member accounts.', icon: Users, show: (c) => c.canManageUsers },
  { href: '/dashboard/committees', label: 'Committees', description: 'Form the Election Committee, dissolve the Executive Committee.', icon: Building2, show: (c) => c.canCreateElectionCommittee || c.canDissolveExecutive || c.canManageElection || c.canGrantElectionAccess },
  { href: '/dashboard/elections', label: 'Elections', description: 'Candidates, posts, uncontested declarations, publish results.', icon: Vote, show: (c) => c.canManageElection },
  { href: '/dashboard/finance', label: 'Finance', description: 'Transactions, fund heads, running balance, reports.', icon: Wallet, show: (c) => c.canManageFinance || c.canViewFinanceOversight },
  { href: '/dashboard/notices', label: 'Notices', description: 'Publish notices, draft with AI, generate letterhead PDFs.', icon: Megaphone, show: (c) => c.canPublishGeneralNotice || c.canPublishInternalNotice || c.canPublishElectionNotice },
  { href: '/dashboard/attendance', label: 'Attendance', description: 'Create forms, share the public link, view submissions.', icon: ClipboardList, show: (c) => c.canManageAttendance || c.canViewAttendanceOversight },
  { href: '/dashboard/resolutions', label: 'Resolutions', description: 'Record meeting minutes and decisions.', icon: FileText, show: (c) => c.canManageResolution },
  { href: '/dashboard/documents', label: 'Documents', description: 'Attach hosted files to notices and resolutions.', icon: FolderOpen, show: (c) => c.canManageDocument },
  { href: '/dashboard/members', label: 'Members & Messages', description: 'Review Join Us applications and Contact messages.', icon: Mail, show: (c) => c.canManageMembership || c.canViewContactMessages },
  { href: '/dashboard/events', label: 'Events', description: 'Manage club events.', icon: CalendarDays, show: (c) => c.canManageEvents },
];

export function DashboardOverview() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingApplications, setPendingApplications] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meData = await apiGet<Me>('/api/panel/me');
        setMe(meData);
        if (meData.capabilities.canManageMembership) {
          const apps = await apiGet<{ pagination: { total: number } }>(
            '/api/panel/membership-applications?status=PENDING&pageSize=1'
          );
          setPendingApplications(apps.pagination.total);
        }
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center gap-2 bg-background text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard...
      </main>
    );
  }
  if (error || !me) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error || 'Could not load your profile.'}
        </p>
      </main>
    );
  }

  const visibleCards = CARDS.filter((card) => card.show(me.capabilities));

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">
            Welcome, {me.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {me.post ?? me.role} · {me.role === 'EXECUTIVE_COMMITTEE' ? 'Executive Committee' : 'Election Committee'}
            {me.committeeStatus && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${me.committeeStatus === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                Committee: {me.committeeStatus}
              </span>
            )}
          </p>
        </div>

        {me.committeeStatus === 'DISSOLVED' && (
          <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Your committee has been dissolved. Most panel actions are no longer available to you.</p>
          </div>
        )}

        {pendingApplications !== null && pendingApplications > 0 && (
          <Link
            href="/dashboard/members"
            className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary hover:bg-primary/10"
          >
            <span>{pendingApplications} Join Us application(s) waiting for review</span>
            <span className="font-semibold">Review →</span>
          </Link>
        )}

        {visibleCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-text-muted">
            Your post doesn&apos;t have a dedicated panel section yet. Contact the President if you believe this is
            wrong.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 font-heading text-base font-bold text-text-main">{card.label}</p>
                  <p className="mt-1 text-sm text-text-muted">{card.description}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
