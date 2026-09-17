'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LockKeyhole, ArrowRight } from 'lucide-react';

const committeeRoles = [
  {
    value: 'EXECUTIVE_COMMITTEE',
    label: 'Executive Committee',
    positions: [
      { value: 'GENERAL_SECRETARY', label: 'General Secretary' },
      { value: 'TREASURER', label: 'Treasurer' },
      { value: 'EVENT_COORDINATOR', label: 'Event Coordinator' },
      { value: 'MEMBER', label: 'Member' },
      { value: 'PRESIDENT', label: 'President' },
    ],
  },
  {
    value: 'ELECTION_COMMITTEE',
    label: 'Election Committee',
    positions: [
      { value: 'CHIEF_ELECTION_OFFICER', label: 'Chief Election Officer' },
      { value: 'ELECTION_COMMISSIONER', label: 'Election Commissioner' },
      { value: 'RETURNING_OFFICER', label: 'Returning Officer' },
      { value: 'MEMBER', label: 'Member' },
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get('next') || '/dashboard', [searchParams]);

  const [selectedRole, setSelectedRole] = useState<'EXECUTIVE_COMMITTEE' | 'ELECTION_COMMITTEE'>('EXECUTIVE_COMMITTEE');
  const [positionsByRole, setPositionsByRole] = useState<Record<string, string>>({
    EXECUTIVE_COMMITTEE: 'GENERAL_SECRETARY',
    ELECTION_COMMITTEE: 'CHIEF_ELECTION_OFFICER',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (role: 'EXECUTIVE_COMMITTEE' | 'ELECTION_COMMITTEE') => {
    setSelectedRole(role);
    const nextPosition = positionsByRole[role] ?? committeeRoles.find((item) => item.value === role)?.positions[0]?.value ?? 'GENERAL_SECRETARY';
    setPassword('');
    setEmail('');
    setError('');
    if (nextPosition) {
      // Keep the selected interface position in sync without forcing a fake default login identifier.
      setPositionsByRole((current) => ({ ...current, [role]: nextPosition }));
    }
  };

  const selectedPosition = positionsByRole[selectedRole] ?? committeeRoles[0].positions[0].value;

  const handlePositionChange = (role: 'EXECUTIVE_COMMITTEE' | 'ELECTION_COMMITTEE', value: string) => {
    setPositionsByRole((current) => ({
      ...current,
      [role]: value,
    }));
    setPassword('');
    setEmail('');
    setError('');
    setSelectedRole(role);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password.');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Login failed. Please try again.');
      }

      const realRole = payload?.user?.role ?? selectedRole;
      const realPosition = payload?.user?.post?.name
        ? payload.user.post.name.toUpperCase().replace(/\s+/g, '_')
        : selectedPosition;

      const safeNext = next.startsWith('/') ? next : '/dashboard';
      const redirectUrl = new URL(safeNext, window.location.origin);
      redirectUrl.searchParams.set('role', realRole);
      redirectUrl.searchParams.set('position', realPosition);

      router.push(`${redirectUrl.pathname}${redirectUrl.search}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
        <div className="grid md:grid-cols-2">
          <div className="hidden bg-primary/95 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">NEUCC Portal</p>
              <h1 className="mt-4 font-heading text-4xl font-bold">Committee Access</h1>
            </div>

            <div className="space-y-4 text-sm text-blue-100">
              <p>Secure access for executive and election committee members.</p>
              <p>Use your committee credentials to manage events, notices, and governance operations.</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Sign in</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-text-main">Welcome back</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-text-main">Role</label>

                <div className="space-y-3">
                  {committeeRoles.map((group) => {
                    const activeGroup = selectedRole === group.value;
                    const currentPositions = group.positions;
                    const selectedValue = positionsByRole[group.value] ?? currentPositions[0].value;

                    return (
                      <div
                        key={group.value}
                        className={`rounded-2xl border p-3 transition ${
                          activeGroup
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleRoleChange(group.value as 'EXECUTIVE_COMMITTEE' | 'ELECTION_COMMITTEE')}
                          className="flex w-full items-center justify-between rounded-xl text-left text-sm font-medium text-text-main"
                        >
                          <span>{group.label}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
                            {activeGroup ? 'Selected' : 'Select'}
                          </span>
                        </button>

                        <div className="mt-3">
                          <label htmlFor={`role-${group.value}`} className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                            Select other role
                          </label>
                          <select
                            id={`role-${group.value}`}
                            value={selectedValue}
                            onChange={(event) => handlePositionChange(group.value as 'EXECUTIVE_COMMITTEE' | 'ELECTION_COMMITTEE', event.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-main outline-none transition focus:border-primary"
                          >
                            {currentPositions.map((position) => (
                              <option key={position.value} value={position.value}>
                                {position.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-main">
                  Email
                </label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-text-main outline-none transition focus:border-primary"
                    placeholder="president@neucc.edu"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-main">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-text-main outline-none transition focus:border-primary"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
