import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-main"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <span className="inline-flex rounded-full border border-border bg-badge-bg px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-badge-text">
              Secure access
            </span>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-text-main sm:text-5xl">
                NEUCC member access
              </h1>
              <p className="max-w-lg text-lg text-text-muted">
                Sign in to manage notices, events, members, payments, and committee operations for the Netrokona University Computer Club.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm font-medium text-text-main">Chair & committee</p>
                <p className="mt-2 text-sm text-text-muted">Control club operations and board updates.</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm font-medium text-text-main">Event & notices</p>
                <p className="mt-2 text-sm text-text-muted">Publish schedules, registrations, and announcements.</p>
              </div>
            </div>
          </section>

          <div className="flex justify-center lg:justify-end">
            <Suspense fallback={<div className="h-[460px] w-full max-w-md animate-pulse rounded-[28px] border border-border bg-surface" /> }>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
