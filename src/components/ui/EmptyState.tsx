import { Database, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/70 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Database size={22} />
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold text-text-main">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">{description}</p>
      {href && action && (
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {action}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
