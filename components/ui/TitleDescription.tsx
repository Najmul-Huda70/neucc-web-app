import React from "react";

type TitleDescriptionProps = {
  /** Optional element ID (useful for aria-labelledby) */
  id?: string;
  /** The main heading title */
  title: string;
  /** The description or subtitle paragraph */
  description?: string;
  /** HTML heading tag to render (default is 'h3') */
  as?: "h2" | "h3" | "h4" | "h5";
  /** Optional custom container styling */
  className?: string;
  /** Custom class overrides for the title */
  titleClassName?: string;
  /** Custom class overrides for the description */
  descClassName?: string;
};

export default function TitleDescription({
  id,
  title,
  description,
  as = "h3",
  className = "",
  titleClassName = "",
  descClassName = "",
}: TitleDescriptionProps) {
  const HeadingTag = as;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Title with Serif font and Primary text token */}
      <HeadingTag
        id={id}
        className={`font-serif text-2xl tracking-tight text-(--text-primary) transition-colors duration-200 ${titleClassName}`}
      >
        {title}
      </HeadingTag>

      {/* Description with Muted text token for readability */}
      {description && (
        <p className={`text-sm leading-relaxed text-(--text-muted) ${descClassName}`}>
          {description}
        </p>
      )}
    </div>
  );
}