import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ActionLinkProps = {
  /** Text to display inside the link */
  label: string;
  /** Navigation destination URL (if provided, renders Next.js Link) */
  href?: string;
  /** Click handler function (if used as a button action) */
  onClick?: () => void;
  /** Custom class overrides */
  className?: string;
};

export default function ActionLink({
  label,
  href,
  onClick,
  className = "",
}: ActionLinkProps) {
  const content = (
    <span className={`group inline-flex items-center gap-2 border-b-2 border-(--text-secondary) pb-1 font-sans text-xs uppercase tracking-[0.18em] text-(--text-primary) transition-colors duration-200 cursor-pointer ${className}`}>
      <span>{label}</span>
      <ArrowRight
        size={14}
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1 "
      />
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="inline-block text-left">
      {content}
    </button>
  );
}