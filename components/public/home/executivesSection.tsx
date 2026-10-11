import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

export default function ExecutivesSection() {
  return (
    <section className="py-12 sm:py-16 bg-(--bg-app)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-bg) p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Card Info */}
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--btn-primary-bg)/10 text-(--btn-primary-bg) text-xs font-bold">
              <Users size={14} />
              <span>Leadership & Committees</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight">
              Meet the NEUCC Executives
            </h2>
            <p className="text-xs sm:text-sm text-(--text-muted) font-medium leading-relaxed">
              Explore the dedicated leaders, advisors, and committee members driving innovation and managing club operations.
            </p>
          </div>

          {/* Action Redirect Button */}
          <div className="shrink-0">
            <Link
              href="/committee"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) font-bold text-sm shadow-sm hover:opacity-90 transition-all group"
            >
              <span>View Executive Committee</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}