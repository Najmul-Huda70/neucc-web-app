import React from "react";
import Link from "next/link";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "tab-active"
    | "tab-inactive"
    | "danger"
    | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  href?: string;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  href,
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base Structural Styling
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-sm transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)";

  // Size Variations
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 min-h-[32px]",
    md: "px-5 py-2.5 text-sm gap-2 min-h-[40px]",
    lg: "px-6 py-3.5 text-base gap-2.5 min-h-[48px]",
    icon: "p-2 text-sm h-10 w-10 shrink-0",
  };

  // Color Variants mapped directly to your final CSS Variables
  const variantClasses = {
    // Main CTAs (Pine Teal)
    primary:
      "bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) shadow-xs hover:shadow-md",

    // Inactive Actions & Soft Secondary
    secondary:
      "bg-(--btn-secondary-bg) hover:bg-(--btn-secondary-hover) border border-(--btn-secondary-border) text-(--btn-secondary-text)",

    // Outlined Controls
    outline:
      "bg-transparent border border-(--input-border) hover:border-(--btn-primary-bg) text-(--text-primary) hover:text-(--text-secondary) hover:bg-(--active-tab-bg)",

    // Navigation & Category Filters (Active State)
    "tab-active":
      "bg-(--active-tab-bg) text-(--active-tab-text) font-bold shadow-2xs",

    // Navigation & Category Filters (Inactive State)
    "tab-inactive":
      "bg-transparent text-(--text-muted) hover:text-(--text-primary) hover:bg-(--card-hover)",

    // Destructive Actions
    danger:
      "bg-(--text-important) hover:opacity-90 text-white shadow-xs",

    // Ghost / Text Link style
    ghost:
      "bg-transparent hover:bg-(--active-tab-bg) text-(--text-primary) hover:text-(--text-secondary)",
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  // If href is provided, render as Next.js Link
  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  // Native HTML Button
  return (
    <button className={combinedClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-sm border-2 border-current border-t-transparent" />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}