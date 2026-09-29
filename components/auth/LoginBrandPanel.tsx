import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function LoginBrandPanel() {
  return (
    <div
      className="relative overflow-hidden p-8 sm:p-10 flex flex-col border-b lg:border-b-0 lg:border-r"
      style={{
        backgroundColor: "var(--stat-card-bg)",
        borderColor: "var(--btn-secondary-border)",
      }}
    >
      <div
        className="absolute -top-10 -left-16 w-56 h-56 rounded-full opacity-60"
        style={{ backgroundColor: "var(--badge-bg)" }}
      />
      <div
        className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full opacity-40"
        style={{ backgroundColor: "var(--card-bg)" }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div
          className="inline-flex items-center gap-3 rounded-xl px-4 py-3 mb-8 self-start"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            >
              <Image
                src="/image/Logo-NeU-jpg.jpg"
                alt="Logo NeU"
                width={56}
                height={72}
                priority
                className="object-cover w-full h-full"
              />
            </Link>

            <div className="flex flex-col">
              <Link
                href="/"
                className="text-base sm:text-lg font-bold text-(--text-primary) leading-tight hover:opacity-80 transition-opacity"
              >
                Computer Club
              </Link>
              <Link
                href="https://cse.neu.ac.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors line-clamp-1"
              >
                Department of Computer Science & Engineering
              </Link>
              <Link
                href="https://neu.ac.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[11px] sm:text-xs flex items-center gap-1 font-bold text-(--text-important)"
              >
                Netrokona University
                <ExternalLink
                  size={12}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <a
            href="mailto:help@neucc.org"
            aria-label="Email"
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--btn-secondary-border)",
              color: "var(--text-secondary)",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18v12H3z" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--btn-secondary-border)",
              color: "var(--text-secondary)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.1H7.6V13h2.7v8h3.2Z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--btn-secondary-border)",
              color: "var(--text-secondary)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.94 8.5H4.2V19.8h2.74V8.5ZM5.57 4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM19.8 19.8h-2.73v-5.9c0-1.4-.5-2.36-1.76-2.36-.96 0-1.53.65-1.78 1.27-.09.22-.11.53-.11.84v6.15H10.7s.04-9.98 0-11.3h2.72v1.6c.36-.56 1.01-1.36 2.46-1.36 1.8 0 3.14 1.17 3.14 3.7v7.36Z" />
            </svg>
          </a>
        </div>

        <div className="mt-12">
          <span
            className="block w-8 h-0.5 rounded-full mb-4"
            style={{ backgroundColor: "var(--text-secondary)" }}
          />
          <h2
            className="text-2xl font-bold leading-snug mb-3 max-w-xs"
            style={{ color: "var(--text-primary)" }}
          >
            Your Computer Club community, all in one place.
          </h2>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "var(--text-primary)", opacity: 0.65 }}
          >
            Only registered Computer Club members can sign in. Access events,
            resources, and your member profile securely.
          </p>
        </div>

        <div
          className="mt-auto pt-6 flex items-center justify-between text-xs border-t"
          style={{
            color: "var(--text-primary)",
            opacity: 0.6,
            borderColor: "var(--btn-secondary-border)",
          }}
        >
          <span>Netrokona University</span>
          <span>Developed by Najmul Huda</span>
        </div>
      </div>
    </div>
  );
}