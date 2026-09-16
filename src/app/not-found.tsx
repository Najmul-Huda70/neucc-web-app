import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SearchX size={28} />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-bold text-text-main sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  );
}
