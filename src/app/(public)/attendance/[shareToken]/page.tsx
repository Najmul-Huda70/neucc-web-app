'use client';

import { FormEvent, use, useState } from 'react';

// GET /(public)/attendance/[shareToken] — the missing piece for
// AttendanceForm.shareToken: the public POST endpoint
// (/api/public/attendance/[shareToken]/entries) already existed, but there
// was no page for a Club Member or Advisory Board member (no login, per
// SRS §5.1) to actually reach and submit through. This is that page.
export default function PublicAttendancePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = use(params);

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [batch, setBatch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/public/attendance/${shareToken}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, studentId, batch: Number(batch) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <p className="font-heading text-lg font-bold text-success">Attendance recorded ✓</p>
          <p className="mt-2 text-sm text-text-muted">Thanks, {name}. You&apos;re all set.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-text-main">Mark Attendance</h1>
          <p className="mt-1 text-sm text-text-muted">No login needed — just fill in your details below.</p>
        </div>

        {error && <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{error}</p>}

        <label className="block text-sm font-medium text-text-main">
          Full name
          <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-medium text-text-main">
          Student ID
          <input required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-medium text-text-main">
          Batch (admission year)
          <input required type="number" min={2000} value={batch} onChange={(e) => setBatch(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" />
        </label>

        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </main>
  );
}
