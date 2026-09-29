"use client";

import { Post } from "@/lib/types";

interface MemberCardProps {
  post: Post;
}

export default function MemberCard({ post }: MemberCardProps) {
  // Extract assigned user from UserPost relation array
  const assignedUser = post.user_posts?.[0]?.user;

  return (
    <div className="bg-(--stat-card-bg) border border-(--btn-secondary-border) rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 h-full">
      {/* Image Container */}
      <div className="relative w-full aspect-square xs:aspect-[4/5] flex items-center justify-center bg-(--stat-card-bg) overflow-hidden">
        {assignedUser?.image ? (
          <img
            src={assignedUser.image}
            alt={assignedUser.name || "Member Photo"}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="text-(--text-secondary) font-extrabold text-4xl sm:text-5xl md:text-6xl select-none">
            {assignedUser?.name ? assignedUser.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-14 sm:h-20 bg-linear-to-t from-(--stat-card-bg) to-transparent pointer-events-none" />
      </div>

      {/* Member Details */}
      <div className="p-3 sm:p-5 text-center flex flex-col items-center justify-center space-y-1 flex-1">
        {assignedUser ? (
          <>
            <h4 className="font-bold text-sm sm:text-base text-(--text-primary) leading-tight line-clamp-1 w-full">
              {assignedUser.name}
            </h4>
            <p className="text-[11px] sm:text-xs font-semibold text-(--text-secondary) line-clamp-1 w-full">
              {post.postTitle}
            </p>
            <div className="w-12 sm:w-16 border-b border-(--btn-secondary-border) my-1" />
            <p
              className="text-[10px] sm:text-[11px] text-(--text-secondary) truncate max-w-full px-2"
              title={assignedUser.email}
            >
              {assignedUser.email}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-bold text-sm sm:text-base text-(--text-primary) leading-tight line-clamp-1 w-full">
              {post.postTitle}
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-500 italic pt-1 font-medium">
              Unassigned
            </p>
          </>
        )}
      </div>
    </div>
  );
}