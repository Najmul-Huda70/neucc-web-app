"use client";

import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="event-markdown-section-heading">
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="event-markdown-subheading">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="event-markdown-paragraph">{children}</p>
  ),
};

type EventDescriptionSectionProps = {
  description: string;
  shortDescription?: string | null;
  canManage?: boolean;
  onEditDescription?: () => void;
};

export default function EventDescriptionSection({
  description,
  canManage,
  onEditDescription,
}: EventDescriptionSectionProps) {
  return (
    <section className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-(--border-color) pb-4">
        <h2 className="text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
          About this event
        </h2>

        {canManage && (
          <button
            type="button"
            onClick={onEditDescription}
            className="flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-1.5 text-xs font-bold text-(--text-muted) transition hover:bg-(--card-hover) hover:text-(--text-primary)"
          >
            <FileText size={13} />
            <span>Edit description</span>
          </button>
        )}
      </div>

      <article className="event-markdown event-markdown-editorial mx-0! max-w-3xl! text-left">
        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
          {description}
        </ReactMarkdown>
      </article>
    </section>
  );
}