"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Clock3, FileText, Info } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getMarkdownHeadingMeta(children: ReactNode) {
  const text = String(children).toLowerCase();
  if (text.includes("schedule") || text.includes("time"))
    return { icon: Clock3, className: "event-markdown-heading--schedule" };
  if (text.includes("rule") || text.includes("warning"))
    return { icon: AlertTriangle, className: "event-markdown-heading--rules" };
  return { icon: Info, className: "event-markdown-heading--default" };
}

const markdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => {
    const { icon: Icon, className } = getMarkdownHeadingMeta(children);
    return (
      <h2 className={`event-markdown-section-heading ${className}`}>
        <Icon size={18} aria-hidden="true" />
        <span>{children}</span>
      </h2>
    );
  },
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
  shortDescription,
  canManage,
  onEditDescription,
}: EventDescriptionSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <article className="event-markdown event-markdown-editorial mx-0! max-w-3xl! text-left">
        <div className="mb-8 flex items-center justify-between border-b border-[#d9d5cc] pb-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#9b744e]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9b744e]">
              Event details
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={onEditDescription}
              className="flex items-center gap-1.5 rounded-lg border border-[#d9d5cc] px-3 py-1 text-xs font-bold text-[#7a817b] transition hover:bg-[#faf8f3] hover:text-[#202522]"
            >
              <FileText size={13} />
              <span>Edit Description</span>
            </button>
          )}
        </div>

        <ReactMarkdown
          components={markdownComponents}
          remarkPlugins={[remarkGfm]}
        >
          {description}
        </ReactMarkdown>
      </article>
    </motion.section>
  );
}