import React from "react";
import Link from "next/link";

export interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  href,
  className = "",
  hoverEffect = true,
  padding = "md",
}: CardProps) {
  // Base Structural Layout
  const baseClasses =
    "group relative rounded-sm border border-(--border-color) bg-(--card-bg) overflow-hidden transition-all duration-300 shadow-2xs";

  // Standardized Padding Sizes
  const paddingClasses = {
    none: "p-0",
    sm: "p-3.5 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  // Shared Hover Interaction
  const hoverClasses = hoverEffect
    ? "hover:border-(--btn-primary-bg)/40 hover:bg-(--card-hover) hover:shadow-md hover:-translate-y-1"
    : "";

  const combinedClasses = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${combinedClasses}`}>
        {children}
      </Link>
    );
  }

  return <div className={combinedClasses}>{children}</div>;
}