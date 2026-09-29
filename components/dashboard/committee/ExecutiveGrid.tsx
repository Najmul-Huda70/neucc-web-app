"use client";

import MemberCard from "@/components/MemberCard";
import { Post } from "@/lib/types";

interface ExecutiveGridProps {
  posts: Post[];
  title: string;
}

export default function ExecutiveGrid({ posts, title }: ExecutiveGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-(--btn-secondary-border) rounded-3xl bg-(--stat-card-bg) my-6">
        <p className="text-(--text-secondary) font-medium text-sm">
          No executive posts found for this committee.
        </p>
      </div>
    );
  }

  // Top 2 Executive Members (e.g., President & General Secretary)
  const topTwo = posts.slice(0, 2);
  // Rest of the members
  const restMembers = posts.slice(2);

  return (
    <div className="space-y-8 my-8">
      {/* Section Title */}
      <div className="border-b-2 border-(--text-secondary) w-fit pb-1">
        <h3 className="text-lg font-bold text-(--text-secondary)">
          {title}
        </h3>
      </div>

      {/* Top 2 Executive Members - Centered */}
      {topTwo.length > 0 && (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {topTwo.map((post,i) => (
              <MemberCard key={i} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Rest of Executive Members - Grid */}
      {restMembers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          {restMembers.map((post,i) => (
            <MemberCard key={i} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}