'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, Vote, Wallet, Megaphone, ClipboardList,
  FileText, FolderOpen, Mail, CalendarDays, Image as ImageIcon, Menu, X, LogOut, Loader2,
} from 'lucide-react';
import { apiPost } from '@/lib/api-client';
import type { Capabilities } from '@/lib/auth/capabilities';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: (c: Capabilities) => boolean;
};

// Same idea as DashboardOverview's card grid, but for the persistent nav —
// kept as a single list so the two can be cross-checked easily; every
// capability flag used here also drives a card on the overview page.
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, show: () => true },
  { href: '/dashboard/users', label: 'Members Access', icon: Users, show: (c) => c.canManageUsers },
  { href: '/dashboard/committees', label: 'Committees', icon: Building2, show: (c) => c.canCreateElectionCommittee || c.canDissolveExecutive || c.canManageElection || c.canGrantElectionAccess },
  { href: '/dashboard/elections', label: 'Elections', icon: Vote, show: (c) => c.canManageElection },
  { href: '/dashboard/finance', label: 'Finance', icon: Wallet, show: (c) => c.canManageFinance || c.canViewFinanceOversight },
  { href: '/dashboard/notices', label: 'Notices', icon: Megaphone, show: (c) => c.canPublishGeneralNotice || c.canPublishInternalNotice || c.canPublishElectionNotice },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardList, show: (c) => c.canManageAttendance || c.canViewAttendanceOversight },
  { href: '/dashboard/resolutions', label: 'Resolutions', icon: FileText, show: (c) => c.canManageResolution },
  { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen, show: (c) => c.canManageDocument },
  { href: '/dashboard/members', label: 'Members & Messages', icon: Mail, show: (c) => c.canManageMembership || c.canViewContactMessages },
  { href: '/dashboard/events', label: 'Events', icon: CalendarDays, show: (c) => c.canManageEvents },
];

export function DashboardNav({
  user,
  capabilities,
}: {
  user: { name: string; post: string | null; role: 'ELECTION_COMMITTEE' | 'EXECUTIVE_COMMITTEE' };
  capabilities: Capabilities;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => item.show(capabilities));

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiPost('/api/auth/logout');
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const isActive = (href: string) => (href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href));

  const NavLinks = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-background hover:text-text-main'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-main">{user.name}</p>
          <p className="truncate text-xs text-text-muted">{user.post ?? user.role}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="rounded-lg border border-border p-2 text-text-main"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="flex flex-col border-b border-border bg-surface lg:hidden">
          {NavLinks}
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm font-semibold text-error disabled:opacity-60"
            >
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="border-b border-border p-4">
          <p className="truncate font-heading text-sm font-bold text-text-main">{user.name}</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {user.post ?? (user.role === 'EXECUTIVE_COMMITTEE' ? 'Executive Committee' : 'Election Committee')}
          </p>
        </div>
        {NavLinks}
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm font-semibold text-error hover:bg-error/10 disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
