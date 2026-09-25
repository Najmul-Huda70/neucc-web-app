"use client";

import { Calendar, Shield, AlertOctagon, User, Mail } from "lucide-react";
import { CommitteeItem } from "./ActiveCommitteeCard";

interface PreviousCommitteeCardProps {
  committee: CommitteeItem;
}

export default function PreviousCommitteeCard({ committee }: PreviousCommitteeCardProps) {
  const isBlocked = committee.status === "BLOCKED";

  return (
    <div
      className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 transition-all opacity-90 hover:opacity-100"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)" }}
    >
      <div className="space-y-3">
        {/* Header: Type & Status Badge */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-gray-500/10 text-gray-500 border border-gray-500/20">
            {committee.type}
          </span>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isBlocked
                ? "bg-red-500/10 text-red-600 border-red-500/20"
                : "bg-gray-500/10 text-gray-500 border-gray-500/20"
            }`}
          >
            {committee.status}
          </span>
        </div>

        {/* Session Info */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <Calendar size={14} /> Session:
          </div>
          <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {committee.session}
          </p>
        </div>

        {/* Block Reason Note if available */}
        {isBlocked && committee.blockReason && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertOctagon size={13} /> Block Reason:
            </div>
            <p className="text-[11px] leading-relaxed italic">{committee.blockReason}</p>
          </div>
        )}
      </div>

      {/* Posts & Admins List */}
      <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--btn-secondary-border)" }}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-gray-400" /> Assigned Posts & Admins
          </span>
        </div>

        <div className="space-y-2">
          {committee.posts && committee.posts.length > 0 ? (
            committee.posts.map((post, idx) => {
              const assignedUsers = post.users && post.users.length > 0 
                ? post.users 
                : post.user ? [post.user] : [];

              return (
                <div
                  key={post.postId || idx}
                  className="p-3 rounded-xl border text-xs bg-black/5 dark:bg-white/5 space-y-2"
                  style={{ borderColor: "var(--btn-secondary-border)" }}
                >
                  <div className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
                    Post: {post.postTitle}
                  </div>

                  {assignedUsers.length > 0 ? (
                    assignedUsers.map((u) => (
                      <div key={u.userId} className="space-y-0.5 pt-1 border-t border-black/5 dark:border-white/5 first:border-0 first:pt-0">
                        <p className="font-semibold flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                          <User size={12} className="text-gray-400" /> {u.name}
                        </p>
                        <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                          <Mail size={11} className="text-gray-400" /> {u.email} <span className="text-gray-400">({u.userId})</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-[11px]">No admin assigned</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic">No posts assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}