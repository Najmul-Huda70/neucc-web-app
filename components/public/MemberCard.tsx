import { Post } from "@/lib/types";

interface MemberCardProps {
  post: Post;
}

export default function MemberCard({ post }: MemberCardProps) {
  // Extract assigned user from UserPost relation array
  const assignedUser = post.user_posts?.[0]?.user;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-(--border-color) bg-(--card-bg) shadow-2xs">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-(--card-bg) xs:aspect-[4/5]">
        {assignedUser?.image ? (
          <img
            src={assignedUser.image}
            alt={assignedUser.name || "Member Photo"}
            className="block h-full w-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full select-none items-center justify-center text-4xl font-extrabold text-(--text-muted) sm:text-5xl md:text-6xl">
            {assignedUser?.name ? assignedUser.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}

        {/* Fade into the details area. -bottom-px overlaps the seam so no line shows. */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-16 bg-linear-to-t from-(--card-bg) via-(--card-bg)/60 to-transparent" />
      </div>

      {/* Member Details */}
      <div className="flex flex-1 flex-col items-center justify-center space-y-1 bg-(--card-bg) p-4 text-center sm:p-5">
        {assignedUser ? (
          <>
            <h4 className="line-clamp-1 w-full text-sm font-bold leading-tight text-(--text-primary) sm:text-base">
              {assignedUser.name}
            </h4>
            <p className="line-clamp-1 w-full text-[11px] font-semibold text-(--text-muted) sm:text-xs">
              {post.postTitle}
            </p>
            <div className="my-1.5 w-12 border-b border-(--border-color) sm:w-16" />
            <p
              className="max-w-full truncate px-2 text-[10px] text-(--text-muted) sm:text-[11px]"
              title={assignedUser.email}
            >
              {assignedUser.email}
            </p>
          </>
        ) : (
          <>
            <h4 className="line-clamp-1 w-full text-sm font-bold leading-tight text-(--text-primary) sm:text-base">
              {post.postTitle}
            </h4>
            <p className="pt-1 text-[11px] font-medium italic text-amber-500 sm:text-xs">
              Unassigned
            </p>
          </>
        )}
      </div>
    </div>
  );
}